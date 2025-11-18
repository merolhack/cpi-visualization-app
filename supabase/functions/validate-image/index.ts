// supabase/functions/validate-image/index.ts
// Versión con ImageScript (100% compatible con Supabase Edge Runtime)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Image } from "imagescript";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configuración de optimización
const IMAGE_CONFIG = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 80,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No se proporcionó ningún archivo' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📥 Archivo recibido: ${file.name} (${(file.size / 1024).toFixed(2)} KB, ${file.type})`);

    // Validar tipo MIME
    const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validMimeTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({ 
          error: 'Tipo de archivo no válido',
          detail: `Solo se aceptan imágenes JPG, PNG, GIF, WebP`
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar tamaño inicial (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ 
          error: 'Archivo demasiado grande',
          detail: `Máximo 10MB`
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Validar firma del archivo
    if (!validateImageSignature(uint8Array)) {
      return new Response(
        JSON.stringify({ 
          error: 'El archivo no es una imagen válida',
          detail: 'La firma del archivo no corresponde a una imagen'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const hasExifData = checkForExifData(uint8Array);
    console.log(`📱 Foto de celular: ${hasExifData ? 'Sí' : 'No'}`);

    // Optimizar imagen usando ImageScript
    console.log('🔄 Optimizando imagen...');
    const optimizedImage = await optimizeImageWithImageScript(arrayBuffer, file.type);
    
    const originalSizeKB = (file.size / 1024).toFixed(2);
    const optimizedSizeKB = (optimizedImage.byteLength / 1024).toFixed(2);
    const compressionPercent = ((1 - optimizedImage.byteLength / file.size) * 100).toFixed(1);
    
    console.log(`✅ Tamaño: ${originalSizeKB}KB → ${optimizedSizeKB}KB (${compressionPercent}% reducción)`);

    // Subir a Supabase Storage
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const fileName = `${Date.now()}-${crypto.randomUUID()}.jpg`;
    const filePath = `products/${fileName}`;

    const { error } = await supabase.storage
      .from('product-images')
      .upload(filePath, optimizedImage, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return new Response(
      JSON.stringify({ 
        success: true,
        url: publicUrl,
        fileName: fileName,
        hasExifData: hasExifData,
        optimization: {
          originalSize: `${originalSizeKB} KB`,
          optimizedSize: `${optimizedSizeKB} KB`,
          reduction: `${compressionPercent}%`
        },
        message: `Imagen optimizada (reducida ${compressionPercent}%)`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Error al procesar la imagen',
        detail: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Optimiza imagen usando ImageScript (compatible con Deno)
 */
async function optimizeImageWithImageScript(imageBuffer: ArrayBuffer, mimeType: string): Promise<Uint8Array> {
  // Decodificar imagen
  const image = await Image.decode(imageBuffer);
  
  let { width, height } = image;
  
  // Calcular nuevas dimensiones manteniendo proporción
  if (width > IMAGE_CONFIG.maxWidth || height > IMAGE_CONFIG.maxHeight) {
    const ratio = Math.min(
      IMAGE_CONFIG.maxWidth / width,
      IMAGE_CONFIG.maxHeight / height
    );
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }
  
  console.log(`📐 Dimensiones: ${image.width}x${image.height} → ${width}x${height}`);
  
  // Redimensionar imagen
  image.resize(width, height);
  
  // Convertir a JPEG con calidad especificada
  let quality = IMAGE_CONFIG.quality;
  let output = await image.encodeJPEG(quality);
  
  // Si es muy grande, reducir calidad gradualmente
  const maxSizeKB = 500;
  while (output.byteLength > maxSizeKB * 1024 && quality > 50) {
    quality -= 10;
    console.log(`⚙️  Reduciendo calidad a ${quality}%...`);
    output = await image.encodeJPEG(quality);
  }
  
  return output;
}

function validateImageSignature(bytes: Uint8Array): boolean {
  // JPG/JPEG
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) return true;
  
  // PNG
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) return true;
  
  // GIF
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) return true;
  
  // WebP
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return true;
  
  return false;
}

function checkForExifData(bytes: Uint8Array): boolean {
  const exifMarker = [0x45, 0x78, 0x69, 0x66]; // "Exif"
  for (let i = 0; i < Math.min(bytes.length - 4, 1000); i++) {
    if (bytes[i] === exifMarker[0] && bytes[i + 1] === exifMarker[1] && 
        bytes[i + 2] === exifMarker[2] && bytes[i + 3] === exifMarker[3]) {
      return true;
    }
  }
  return false;
}