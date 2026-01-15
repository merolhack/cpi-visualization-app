-- Schedule daily CPI recalculation at midnight
-- Uses Supabase pg_cron extension

-- Enable pg_cron if not already enabled
-- Note: This may require superuser privileges or be pre-enabled in Supabase

-- Schedule the recalculation to run daily at midnight (00:00 UTC)
SELECT cron.schedule(
    'recalculate-cpi-daily',           -- job name
    '0 0 * * *',                       -- cron expression: midnight every day
    'SELECT recalculate_daily_cpi();'  -- SQL to execute
);

-- Verify the job was created
SELECT 
    jobid,
    jobname,
    schedule,
    command,
    active
FROM cron.job
WHERE jobname = 'recalculate-cpi-daily';
