use serde::Serialize;
use sysinfo::System;

#[derive(Debug, Serialize)]
pub struct SystemMetrics {
    pub cpu_usage_percent: f32,
    pub memory_used_mb: u64,
    pub memory_total_mb: u64,
    pub memory_usage_percent: f64,
    pub disk_used_gb: u64,
    pub disk_total_gb: u64,
    pub disk_usage_percent: f64,
    pub uptime_secs: u64,
}

pub struct SystemMonitor {
    sys: System,
}

impl SystemMonitor {
    pub fn new() -> Self {
        Self {
            sys: System::new_all(),
        }
    }

    pub fn collect(&mut self) -> SystemMetrics {
        self.sys.refresh_all();

        let cpu = self.sys.global_cpu_usage();
        let mem_used = self.sys.used_memory() / (1024 * 1024);
        let mem_total = self.sys.total_memory() / (1024 * 1024);
        let mem_pct = if mem_total > 0 {
            (mem_used as f64 / mem_total as f64) * 100.0
        } else {
            0.0
        };

        // Get root disk usage
        let (disk_used, disk_total) = self
            .sys
            .disks()
            .iter()
            .find(|d| d.mount_point() == std::path::Path::new("/"))
            .map(|d| {
                let total = d.total_space() / (1024 * 1024 * 1024);
                let available = d.available_space() / (1024 * 1024 * 1024);
                (total - available, total)
            })
            .unwrap_or((0, 0));

        let disk_pct = if disk_total > 0 {
            (disk_used as f64 / disk_total as f64) * 100.0
        } else {
            0.0
        };

        SystemMetrics {
            cpu_usage_percent: cpu,
            memory_used_mb: mem_used,
            memory_total_mb: mem_total,
            memory_usage_percent: mem_pct,
            disk_used_gb: disk_used,
            disk_total_gb: disk_total,
            disk_usage_percent: disk_pct,
            uptime_secs: System::uptime(),
        }
    }

    /// Check if system is healthy. Returns list of issues.
    pub fn check_health(&mut self) -> Vec<String> {
        let metrics = self.collect();
        let mut issues = Vec::new();

        if metrics.cpu_usage_percent > 90.0 {
            issues.push(format!(
                "🔴 CPU kullanımı kritik: {:.1}%",
                metrics.cpu_usage_percent
            ));
        } else if metrics.cpu_usage_percent > 80.0 {
            issues.push(format!(
                "🟡 CPU kullanımı yüksek: {:.1}%",
                metrics.cpu_usage_percent
            ));
        }

        if metrics.memory_usage_percent > 95.0 {
            issues.push(format!(
                "🔴 Bellek kullanımı kritik: {:.1}%",
                metrics.memory_usage_percent
            ));
        } else if metrics.memory_usage_percent > 85.0 {
            issues.push(format!(
                "🟡 Bellek kullanımı yüksek: {:.1}%",
                metrics.memory_usage_percent
            ));
        }

        if metrics.disk_usage_percent > 95.0 {
            issues.push(format!(
                "🔴 Disk kullanımı kritik: {:.1}%",
                metrics.disk_usage_percent
            ));
        } else if metrics.disk_usage_percent > 85.0 {
            issues.push(format!(
                "🟡 Disk kullanımı yüksek: {:.1}%",
                metrics.disk_usage_percent
            ));
        }

        issues
    }
}
