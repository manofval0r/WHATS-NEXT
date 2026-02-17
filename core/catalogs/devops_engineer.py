"""
DevOps Engineer — Career Path Catalog
======================================
From Linux fundamentals through CI/CD, containers,
orchestration, infrastructure as code, cloud platforms,
and observability. A complete path to production-grade
infrastructure engineering.

Modules: 14 (hard skills + soft skills + capstone)
"""

DEVOPS_ENGINEER = {
    "role": "devops",
    "title": "DevOps Engineer",
    "description": "From Linux fundamentals through CI/CD, containers, orchestration, cloud platforms, and observability. Build, deploy, and operate reliable systems at scale.",
    "modules": [
        # ── 0  Linux & Shell Scripting ────────────────────────────
        {
            "label": "Linux & Shell Scripting",
            "description": "Every server runs Linux. Master the command line, file system, permissions, processes, and shell scripting for automation.",
            "market_value": "Med",
            "node_type": "core",
            "connections": [1, 2],
            "project_prompt": "Write a Bash toolkit: a log parser, a backup script with cron, a system health checker, and a user provisioning script — all tested on a Linux VM.",
            "resources": {
                "primary": [
                    {"title": "Linux Journey", "url": "https://linuxjourney.com/", "type": "interactive"},
                    {"title": "The Missing Semester (MIT)", "url": "https://missing.csail.mit.edu/", "type": "interactive"},
                ],
                "additional": [
                    {"title": "Bash Scripting Tutorial", "url": "https://www.shellscript.sh/", "type": "docs"},
                    {"title": "OverTheWire Bandit", "url": "https://overthewire.org/wargames/bandit/", "type": "interactive"},
                    {"title": "TechWorld with Nana Linux", "url": "https://www.youtube.com/watch?v=jS9t3KHMhIk", "type": "video"},
                ],
            },
            "lessons": [
                {"title": "Terminal Basics", "description": "Navigation: pwd, ls, cd, mkdir, cp, mv, rm, man pages.", "phase": 1, "order": 1, "estimated_minutes": 20},
                {"title": "File System & Permissions", "description": "Linux file hierarchy, chmod, chown, groups, sticky bit.", "phase": 1, "order": 2, "estimated_minutes": 25},
                {"title": "Users & Processes", "description": "useradd, sudo, ps, top, kill, systemctl, services.", "phase": 1, "order": 3, "estimated_minutes": 25},
                {"title": "Text Processing Tools", "description": "grep, sed, awk, cut, sort, uniq — pipeline processing.", "phase": 2, "order": 4, "estimated_minutes": 30},
                {"title": "Bash Scripting Fundamentals", "description": "Variables, conditionals, loops, functions, exit codes.", "phase": 2, "order": 5, "estimated_minutes": 30},
                {"title": "Advanced Bash & Cron Jobs", "description": "Arrays, string manipulation, cron, logging, trap.", "phase": 2, "order": 6, "estimated_minutes": 30},
                {"title": "Package Management", "description": "apt, yum, dnf, snap — installing and managing software.", "phase": 3, "order": 7, "estimated_minutes": 20},
                {"title": "SSH & Remote Administration", "description": "SSH keys, config, SCP, tunnels, remote troubleshooting.", "phase": 3, "order": 8, "estimated_minutes": 25},
                {"title": "Disk & Storage Management", "description": "df, du, lsblk, mount, LVM basics, disk monitoring.", "phase": 3, "order": 9, "estimated_minutes": 25},
            ],
        },

        # ── 1  Networking Fundamentals ────────────────────────────
        {
            "label": "Networking Fundamentals",
            "description": "Understand how the internet works. TCP/IP, DNS, HTTP, firewalls, load balancers, and network troubleshooting.",
            "market_value": "Med",
            "node_type": "core",
            "connections": [3],
            "project_prompt": "Set up a network lab: configure DNS, set up iptables firewall rules, use tcpdump/Wireshark to capture traffic, and document the network topology.",
            "resources": {
                "primary": [
                    {"title": "Computer Networking (top-down approach)", "url": "https://gaia.cs.umass.edu/kurose_ross/index.php", "type": "docs"},
                    {"title": "NetworkChuck YouTube", "url": "https://www.youtube.com/@NetworkChuck", "type": "video"},
                ],
                "additional": [
                    {"title": "Cloudflare Learning Center", "url": "https://www.cloudflare.com/learning/", "type": "docs"},
                    {"title": "DNS in One Picture", "url": "https://roadmap.sh/guides/dns-in-one-picture", "type": "docs"},
                    {"title": "HTTP Crash Course", "url": "https://www.youtube.com/watch?v=iYM2zFP3Zn0", "type": "video"},
                ],
            },
            "lessons": [
                {"title": "OSI Model & TCP/IP", "description": "7 layers, encapsulation, packets, what happens when you type a URL.", "phase": 1, "order": 1, "estimated_minutes": 25},
                {"title": "IP Addressing & Subnets", "description": "IPv4, CIDR notation, subnetting, public vs private IPs.", "phase": 1, "order": 2, "estimated_minutes": 25},
                {"title": "DNS Deep Dive", "description": "A, CNAME, MX, NS records, resolution flow, dig command.", "phase": 1, "order": 3, "estimated_minutes": 25},
                {"title": "HTTP/HTTPS & TLS", "description": "Request/response, headers, status codes, TLS handshake.", "phase": 2, "order": 4, "estimated_minutes": 25},
                {"title": "Firewalls & Security Groups", "description": "iptables, ufw, cloud security groups, port management.", "phase": 2, "order": 5, "estimated_minutes": 25},
                {"title": "Load Balancing & Proxies", "description": "Reverse proxy, Nginx, L4 vs L7, health checks.", "phase": 2, "order": 6, "estimated_minutes": 30},
                {"title": "Network Troubleshooting", "description": "ping, traceroute, netstat, ss, nslookup, tcpdump.", "phase": 3, "order": 7, "estimated_minutes": 25},
                {"title": "VPN & Private Networks", "description": "WireGuard, VPCs, peering, network segmentation.", "phase": 3, "order": 8, "estimated_minutes": 25},
            ],
        },

        # ── 2  Git, CI/CD & Automation ────────────────────────────
        {
            "label": "Git, CI/CD & Automation",
            "description": "Automate everything. Git workflows, GitHub Actions, Jenkins, pipeline design, and automated testing for infrastructure.",
            "market_value": "Med-High",
            "node_type": "core",
            "connections": [3, 4],
            "project_prompt": "Build a CI/CD pipeline: GitHub Actions workflow that lints, tests, builds a Docker image, pushes to a registry, and deploys to a staging environment.",
            "resources": {
                "primary": [
                    {"title": "GitHub Actions Docs", "url": "https://docs.github.com/en/actions", "type": "docs"},
                    {"title": "TechWorld with Nana CI/CD", "url": "https://www.youtube.com/watch?v=7S_lqFtOkrQ", "type": "video"},
                ],
                "additional": [
                    {"title": "GitLab CI/CD Docs", "url": "https://docs.gitlab.com/ee/ci/", "type": "docs"},
                    {"title": "Jenkins Pipeline Tutorial", "url": "https://www.jenkins.io/doc/tutorials/", "type": "docs"},
                    {"title": "Learn Git Branching", "url": "https://learngitbranching.js.org/", "type": "interactive"},
                ],
            },
            "lessons": [
                {"title": "Git for DevOps", "description": "Branching strategies, gitflow, trunk-based development.", "phase": 1, "order": 1, "estimated_minutes": 25},
                {"title": "Git Hooks & Automation", "description": "Pre-commit hooks, linting, secret scanning.", "phase": 1, "order": 2, "estimated_minutes": 20},
                {"title": "CI/CD Concepts", "description": "Continuous integration vs delivery vs deployment, pipelines.", "phase": 1, "order": 3, "estimated_minutes": 20},
                {"title": "GitHub Actions Deep Dive", "description": "Workflows, jobs, steps, secrets, matrix builds.", "phase": 2, "order": 4, "estimated_minutes": 30},
                {"title": "Build & Test Automation", "description": "Automated testing, linting, code quality gates.", "phase": 2, "order": 5, "estimated_minutes": 25},
                {"title": "Artifact Management", "description": "Container registries, package publish, versioning.", "phase": 2, "order": 6, "estimated_minutes": 25},
                {"title": "Deployment Strategies", "description": "Blue/green, canary, rolling updates, feature flags.", "phase": 3, "order": 7, "estimated_minutes": 25},
                {"title": "Pipeline Security", "description": "Secret management, SAST, dependency scanning, SBOM.", "phase": 3, "order": 8, "estimated_minutes": 25},
            ],
        },

        # ── 3  Docker & Containers ────────────────────────────────
        {
            "label": "Docker & Containers",
            "description": "Containerize everything. Master Docker from basics through multi-stage builds, Docker Compose, and container security best practices.",
            "market_value": "High",
            "node_type": "core",
            "connections": [5, 6],
            "project_prompt": "Containerize a multi-service application: Dockerfile with multi-stage build, Docker Compose for dev environment, and a custom bridge network.",
            "resources": {
                "primary": [
                    {"title": "Docker Official Getting Started", "url": "https://docs.docker.com/get-started/", "type": "docs"},
                    {"title": "TechWorld with Nana Docker", "url": "https://www.youtube.com/watch?v=3c-iBn73dDE", "type": "video"},
                ],
                "additional": [
                    {"title": "Play with Docker", "url": "https://labs.play-with-docker.com/", "type": "interactive"},
                    {"title": "Docker Best Practices", "url": "https://docs.docker.com/develop/develop-images/guidelines/", "type": "docs"},
                    {"title": "KodeKloud Docker", "url": "https://kodekloud.com/courses/docker-for-the-absolute-beginner/", "type": "interactive"},
                ],
            },
            "lessons": [
                {"title": "Container Concepts", "description": "VMs vs containers, images vs containers, Docker architecture.", "phase": 1, "order": 1, "estimated_minutes": 20},
                {"title": "Docker Basics", "description": "docker run, pull, ps, stop, rm, exec, logs.", "phase": 1, "order": 2, "estimated_minutes": 25},
                {"title": "Dockerfile Deep Dive", "description": "FROM, COPY, RUN, CMD, ENTRYPOINT, layer caching.", "phase": 1, "order": 3, "estimated_minutes": 30},
                {"title": "Multi-Stage Builds", "description": "Smaller images, build vs runtime stages, .dockerignore.", "phase": 2, "order": 4, "estimated_minutes": 25},
                {"title": "Docker Networking", "description": "Bridge, host, overlay networks, port mapping, DNS.", "phase": 2, "order": 5, "estimated_minutes": 25},
                {"title": "Volumes & Persistent Data", "description": "Named volumes, bind mounts, data persistence strategies.", "phase": 2, "order": 6, "estimated_minutes": 25},
                {"title": "Docker Compose", "description": "Multi-container apps, depends_on, environment, scaling.", "phase": 3, "order": 7, "estimated_minutes": 30},
                {"title": "Container Security", "description": "Non-root users, image scanning, secrets, read-only FS.", "phase": 3, "order": 8, "estimated_minutes": 25},
                {"title": "Container Registries", "description": "Docker Hub, ECR, GHCR, tagging strategies, CI integration.", "phase": 3, "order": 9, "estimated_minutes": 20},
            ],
        },

        # ── 4  Infrastructure as Code ─────────────────────────────
        {
            "label": "Infrastructure as Code",
            "description": "Define infrastructure in code. Master Terraform and Ansible to provision and configure servers, networks, and cloud resources reproducibly.",
            "market_value": "High",
            "node_type": "core",
            "connections": [5, 6],
            "project_prompt": "Use Terraform to provision cloud infrastructure (VPC, subnets, EC2/VM, load balancer) and Ansible to configure the servers.",
            "resources": {
                "primary": [
                    {"title": "Terraform Official Tutorials", "url": "https://developer.hashicorp.com/terraform/tutorials", "type": "interactive"},
                    {"title": "TechWorld with Nana Terraform", "url": "https://www.youtube.com/watch?v=7xngnjfIlK4", "type": "video"},
                ],
                "additional": [
                    {"title": "Ansible Getting Started", "url": "https://docs.ansible.com/ansible/latest/getting_started/index.html", "type": "docs"},
                    {"title": "Pulumi (IaC alternative)", "url": "https://www.pulumi.com/docs/get-started/", "type": "docs"},
                    {"title": "KodeKloud Terraform", "url": "https://kodekloud.com/courses/terraform-for-beginners/", "type": "interactive"},
                ],
            },
            "lessons": [
                {"title": "IaC Concepts", "description": "Declarative vs imperative, state, drift, idempotency.", "phase": 1, "order": 1, "estimated_minutes": 20},
                {"title": "Terraform Basics", "description": "Providers, resources, variables, init/plan/apply/destroy.", "phase": 1, "order": 2, "estimated_minutes": 30},
                {"title": "Terraform State & Backends", "description": "State files, remote backends (S3), locking, workspace.", "phase": 1, "order": 3, "estimated_minutes": 25},
                {"title": "Terraform Modules", "description": "Reusable modules, inputs/outputs, module registry.", "phase": 2, "order": 4, "estimated_minutes": 30},
                {"title": "Terraform for Cloud", "description": "AWS VPC, subnets, EC2, security groups — real provisioning.", "phase": 2, "order": 5, "estimated_minutes": 35},
                {"title": "Ansible Fundamentals", "description": "Inventory, playbooks, tasks, handlers, variables.", "phase": 2, "order": 6, "estimated_minutes": 30},
                {"title": "Ansible Roles & Galaxy", "description": "Organizing playbooks, roles directory, Ansible Galaxy.", "phase": 3, "order": 7, "estimated_minutes": 25},
                {"title": "IaC in CI/CD", "description": "Automated terraform plan/apply, policy checks, drift detection.", "phase": 3, "order": 8, "estimated_minutes": 25},
            ],
        },

        # ── 5  Kubernetes ─────────────────────────────────────────
        {
            "label": "Kubernetes",
            "description": "The industry standard for container orchestration. Deploy, scale, and manage containerized applications in production.",
            "market_value": "High",
            "node_type": "core",
            "connections": [7, 8],
            "project_prompt": "Deploy a microservices app to Kubernetes: Deployment, Service, Ingress, ConfigMap, Secrets, HPA, and a Helm chart.",
            "resources": {
                "primary": [
                    {"title": "Kubernetes Official Tutorials", "url": "https://kubernetes.io/docs/tutorials/", "type": "interactive"},
                    {"title": "TechWorld with Nana K8s", "url": "https://www.youtube.com/watch?v=X48VuDVv0do", "type": "video"},
                ],
                "additional": [
                    {"title": "KodeKloud K8s", "url": "https://kodekloud.com/courses/kubernetes-for-the-absolute-beginners-hands-on/", "type": "interactive"},
                    {"title": "Killer Shell (CKA practice)", "url": "https://killer.sh/", "type": "interactive"},
                    {"title": "Kubernetes the Hard Way", "url": "https://github.com/kelseyhightower/kubernetes-the-hard-way", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Kubernetes Architecture", "description": "Control plane, worker nodes, kubelet, kube-proxy, etcd.", "phase": 1, "order": 1, "estimated_minutes": 25},
                {"title": "Pods & Workloads", "description": "Pod spec, Deployments, ReplicaSets, DaemonSets, Jobs.", "phase": 1, "order": 2, "estimated_minutes": 30},
                {"title": "Services & Networking", "description": "ClusterIP, NodePort, LoadBalancer, Ingress, DNS.", "phase": 1, "order": 3, "estimated_minutes": 30},
                {"title": "Configuration & Secrets", "description": "ConfigMaps, Secrets, environment variables, volumes.", "phase": 2, "order": 4, "estimated_minutes": 25},
                {"title": "Storage in Kubernetes", "description": "PersistentVolumes, PVCs, StorageClasses, dynamic provisioning.", "phase": 2, "order": 5, "estimated_minutes": 25},
                {"title": "Scaling & Self-Healing", "description": "HPA, VPA, readiness/liveness probes, resource limits.", "phase": 2, "order": 6, "estimated_minutes": 25},
                {"title": "Helm Charts", "description": "Package management, templates, values, chart repos.", "phase": 3, "order": 7, "estimated_minutes": 30},
                {"title": "RBAC & Security", "description": "Roles, ClusterRoles, ServiceAccounts, network policies.", "phase": 3, "order": 8, "estimated_minutes": 25},
                {"title": "kubectl Mastery", "description": "Debugging pods, logs, exec, port-forward, contexts, common workflows.", "phase": 3, "order": 9, "estimated_minutes": 25},
            ],
        },

        # ── 6  Cloud Platforms (AWS/GCP/Azure) ────────────────────
        {
            "label": "Cloud Platforms (AWS/GCP/Azure)",
            "description": "Build on the cloud. Core services across compute, storage, networking, databases, and managed Kubernetes on AWS, GCP, or Azure.",
            "market_value": "High",
            "node_type": "core",
            "connections": [7, 8],
            "project_prompt": "Build a production-grade cloud architecture: VPC with public/private subnets, auto-scaling group, RDS, S3, CloudFront/CDN, and IAM policies.",
            "resources": {
                "primary": [
                    {"title": "AWS Free Tier", "url": "https://aws.amazon.com/free/", "type": "interactive"},
                    {"title": "GCP Free Tier", "url": "https://cloud.google.com/free", "type": "interactive"},
                ],
                "additional": [
                    {"title": "AWS Well-Architected", "url": "https://aws.amazon.com/architecture/well-architected/", "type": "docs"},
                    {"title": "ACloudGuru / Pluralsight", "url": "https://www.pluralsight.com/cloud-guru", "type": "interactive"},
                    {"title": "Cloud Resume Challenge", "url": "https://cloudresumechallenge.dev/", "type": "interactive"},
                ],
            },
            "lessons": [
                {"title": "Cloud Computing Concepts", "description": "IaaS, PaaS, SaaS, regions, availability zones, global infra.", "phase": 1, "order": 1, "estimated_minutes": 20},
                {"title": "Compute Services", "description": "EC2/VM instances, Lambda/Cloud Functions, auto-scaling.", "phase": 1, "order": 2, "estimated_minutes": 30},
                {"title": "Storage Services", "description": "S3/Cloud Storage, EBS, lifecycle policies, replication.", "phase": 1, "order": 3, "estimated_minutes": 25},
                {"title": "Networking in the Cloud", "description": "VPC, subnets, route tables, NAT gateways, peering.", "phase": 2, "order": 4, "estimated_minutes": 30},
                {"title": "IAM & Security", "description": "Users, roles, policies, least privilege, service accounts.", "phase": 2, "order": 5, "estimated_minutes": 25},
                {"title": "Managed Databases", "description": "RDS, DynamoDB, Cloud SQL — provisioning and backups.", "phase": 2, "order": 6, "estimated_minutes": 25},
                {"title": "Managed Kubernetes (EKS/GKE)", "description": "Cloud-managed K8s, node groups, networking, ingress.", "phase": 3, "order": 7, "estimated_minutes": 30},
                {"title": "Cost Management", "description": "Billing alerts, reserved instances, spot instances, right-sizing.", "phase": 3, "order": 8, "estimated_minutes": 20},
                {"title": "Serverless & Event-Driven", "description": "Lambda, API Gateway, SQS/SNS, event-driven architectures.", "phase": 3, "order": 9, "estimated_minutes": 30},
            ],
        },

        # ── 7  Monitoring & Observability ─────────────────────────
        {
            "label": "Monitoring & Observability",
            "description": "See what's happening in production. Metrics, logs, traces, dashboards, alerting, and incident response.",
            "market_value": "Med-High",
            "node_type": "core",
            "connections": [9, 10],
            "project_prompt": "Set up a complete observability stack: Prometheus metrics, Grafana dashboards, ELK/Loki for logs, alerting rules, and runbooks for common incidents.",
            "resources": {
                "primary": [
                    {"title": "Prometheus Official Docs", "url": "https://prometheus.io/docs/introduction/overview/", "type": "docs"},
                    {"title": "Grafana Tutorials", "url": "https://grafana.com/tutorials/", "type": "interactive"},
                ],
                "additional": [
                    {"title": "Datadog Learning Center", "url": "https://learn.datadoghq.com/", "type": "interactive"},
                    {"title": "SRE Book (Google, free)", "url": "https://sre.google/sre-book/table-of-contents/", "type": "docs"},
                    {"title": "OpenTelemetry Docs", "url": "https://opentelemetry.io/docs/", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Observability Pillars", "description": "Metrics, logs, traces — what each provides and how they relate.", "phase": 1, "order": 1, "estimated_minutes": 20},
                {"title": "Prometheus Metrics", "description": "Counters, gauges, histograms, PromQL basics, exporters.", "phase": 1, "order": 2, "estimated_minutes": 30},
                {"title": "Grafana Dashboards", "description": "Data sources, panels, variables, alerting rules.", "phase": 1, "order": 3, "estimated_minutes": 30},
                {"title": "Log Management", "description": "Structured logging, ELK stack / Loki, log aggregation.", "phase": 2, "order": 4, "estimated_minutes": 25},
                {"title": "Distributed Tracing", "description": "OpenTelemetry, Jaeger, trace context, span analysis.", "phase": 2, "order": 5, "estimated_minutes": 30},
                {"title": "Alerting Best Practices", "description": "Alert fatigue, severity levels, escalation, PagerDuty.", "phase": 2, "order": 6, "estimated_minutes": 25},
                {"title": "SLIs, SLOs & Error Budgets", "description": "Defining reliability, error budgets, SLO-based alerting.", "phase": 3, "order": 7, "estimated_minutes": 25},
                {"title": "Incident Response", "description": "On-call, runbooks, postmortems, blameless culture.", "phase": 3, "order": 8, "estimated_minutes": 25},
            ],
        },

        # ── 8  Security & Compliance ──────────────────────────────
        {
            "label": "Security & Compliance",
            "description": "DevSecOps: embed security into every stage. Container security, secret management, vulnerability scanning, and compliance frameworks.",
            "market_value": "Med-High",
            "node_type": "core",
            "connections": [9, 10],
            "project_prompt": "Harden a cloud deployment: implement secret management (Vault/AWS Secrets Manager), container image scanning, RBAC, and a security checklist.",
            "resources": {
                "primary": [
                    {"title": "OWASP Top 10", "url": "https://owasp.org/www-project-top-ten/", "type": "docs"},
                    {"title": "HashiCorp Vault Tutorials", "url": "https://developer.hashicorp.com/vault/tutorials", "type": "interactive"},
                ],
                "additional": [
                    {"title": "Trivy (container scanning)", "url": "https://aquasecurity.github.io/trivy/", "type": "docs"},
                    {"title": "CIS Benchmarks", "url": "https://www.cisecurity.org/cis-benchmarks", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "DevSecOps Overview", "description": "Shift-left security, threat modeling, security in CI/CD.", "phase": 1, "order": 1, "estimated_minutes": 20},
                {"title": "Secret Management", "description": "Vault, AWS Secrets Manager, env vars, rotation.", "phase": 1, "order": 2, "estimated_minutes": 25},
                {"title": "Container Image Security", "description": "Trivy, Snyk, base image selection, CVE monitoring.", "phase": 2, "order": 3, "estimated_minutes": 25},
                {"title": "Network Security", "description": "Zero trust, mTLS, service mesh security, WAFs.", "phase": 2, "order": 4, "estimated_minutes": 25},
                {"title": "Supply Chain Security", "description": "SBOM, signed images, dependency scanning, Sigstore.", "phase": 2, "order": 5, "estimated_minutes": 25},
                {"title": "Compliance & Auditing", "description": "SOC 2, GDPR, audit logs, policy-as-code (OPA).", "phase": 3, "order": 6, "estimated_minutes": 25},
                {"title": "Incident Detection", "description": "SIEM basics, anomaly detection, cloud audit trails.", "phase": 3, "order": 7, "estimated_minutes": 25},
            ],
        },

        # ── 9  Site Reliability Engineering ───────────────────────
        {
            "label": "Site Reliability Engineering",
            "description": "Build reliable systems at scale. SRE principles, capacity planning, chaos engineering, and performance optimization.",
            "market_value": "High",
            "node_type": "core",
            "connections": [11, 12],
            "project_prompt": "Write SLOs for a production service, set up error budget tracking, implement a chaos experiment (e.g., pod kill), and write an incident postmortem.",
            "resources": {
                "primary": [
                    {"title": "Google SRE Book (free)", "url": "https://sre.google/sre-book/table-of-contents/", "type": "docs"},
                    {"title": "Google SRE Workbook (free)", "url": "https://sre.google/workbook/table-of-contents/", "type": "docs"},
                ],
                "additional": [
                    {"title": "Chaos Engineering (Netflix)", "url": "https://principlesofchaos.org/", "type": "docs"},
                    {"title": "Gremlin (chaos engineering)", "url": "https://www.gremlin.com/community/tutorials/", "type": "interactive"},
                ],
            },
            "lessons": [
                {"title": "SRE Principles", "description": "Eliminating toil, embracing risk, production ownership.", "phase": 1, "order": 1, "estimated_minutes": 25},
                {"title": "SLOs in Practice", "description": "Choosing SLIs, setting SLOs, error budget policies.", "phase": 1, "order": 2, "estimated_minutes": 25},
                {"title": "Capacity Planning", "description": "Load testing, forecasting, provisioning, autoscaling.", "phase": 2, "order": 3, "estimated_minutes": 25},
                {"title": "Chaos Engineering", "description": "Steady state, hypotheses, blast radius, running experiments.", "phase": 2, "order": 4, "estimated_minutes": 30},
                {"title": "Performance Optimization", "description": "Profiling, bottleneck analysis, caching strategies.", "phase": 2, "order": 5, "estimated_minutes": 25},
                {"title": "Toil Reduction", "description": "Identifying toil, automation, self-service platforms.", "phase": 3, "order": 6, "estimated_minutes": 20},
                {"title": "Postmortems & Learning", "description": "Blameless culture, writing good postmortems, action items.", "phase": 3, "order": 7, "estimated_minutes": 20},
            ],
        },

        # ── 10  GitOps & Platform Engineering ────────────────────
        {
            "label": "GitOps & Platform Engineering",
            "description": "Next-level DevOps. GitOps with ArgoCD/Flux, internal developer platforms, and building self-service infrastructure.",
            "market_value": "Med-High",
            "node_type": "core",
            "connections": [12, 13],
            "project_prompt": "Set up GitOps: ArgoCD watches a Git repo and auto-deploys to K8s. Add a Backstage developer portal with service catalog and templates.",
            "resources": {
                "primary": [
                    {"title": "ArgoCD Official Docs", "url": "https://argo-cd.readthedocs.io/", "type": "docs"},
                    {"title": "FluxCD Docs", "url": "https://fluxcd.io/docs/", "type": "docs"},
                ],
                "additional": [
                    {"title": "Backstage by Spotify", "url": "https://backstage.io/docs/overview/what-is-backstage", "type": "docs"},
                    {"title": "Platform Engineering (Humanitec)", "url": "https://platformengineering.org/", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "GitOps Principles", "description": "Declarative, versioned, automated, self-healing.", "phase": 1, "order": 1, "estimated_minutes": 20},
                {"title": "ArgoCD Setup & Usage", "description": "Install, connecting repos, Application CRD, sync policies.", "phase": 1, "order": 2, "estimated_minutes": 30},
                {"title": "ArgoCD Advanced", "description": "App-of-apps, Kustomize, ApplicationSets, rollback.", "phase": 2, "order": 3, "estimated_minutes": 30},
                {"title": "Platform Engineering Concepts", "description": "Internal developer platform, golden paths, self-service.", "phase": 2, "order": 4, "estimated_minutes": 25},
                {"title": "Backstage Developer Portal", "description": "Service catalog, templates, TechDocs, plugins.", "phase": 3, "order": 5, "estimated_minutes": 30},
                {"title": "Infrastructure Automation", "description": "Crossplane, Terraform Operator, self-service templates.", "phase": 3, "order": 6, "estimated_minutes": 25},
            ],
        },

        # ── 11  Scripting & Automation (Python/Go) ────────────────
        {
            "label": "Scripting & Automation (Python/Go)",
            "description": "Go beyond Bash. Use Python and Go for complex automation, custom tooling, controllers, and operator development.",
            "market_value": "Med-High",
            "node_type": "core",
            "connections": [12, 13],
            "project_prompt": "Build a CLI tool (Python or Go) that automates a common DevOps task: e.g., Kubernetes resource cleanup, log analysis, or infrastructure provisioning.",
            "resources": {
                "primary": [
                    {"title": "Python for DevOps Book", "url": "https://www.oreilly.com/library/view/python-for-devops/9781492057680/", "type": "docs"},
                    {"title": "Go by Example", "url": "https://gobyexample.com/", "type": "docs"},
                ],
                "additional": [
                    {"title": "Click (Python CLI)", "url": "https://click.palletsprojects.com/", "type": "docs"},
                    {"title": "Cobra (Go CLI)", "url": "https://cobra.dev/", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Python for Automation", "description": "os, subprocess, pathlib, jinja2, boto3.", "phase": 1, "order": 1, "estimated_minutes": 25},
                {"title": "Building CLI Tools (Python)", "description": "argparse, click, rich, packaging and distributing.", "phase": 1, "order": 2, "estimated_minutes": 25},
                {"title": "Kubernetes API with Python", "description": "kubernetes Python client, listing/creating resources.", "phase": 2, "order": 3, "estimated_minutes": 25},
                {"title": "Go Fundamentals for DevOps", "description": "Types, structs, interfaces, goroutines, error handling.", "phase": 2, "order": 4, "estimated_minutes": 35},
                {"title": "Building Tools in Go", "description": "Flag, cobra, HTTP clients, JSON parsing.", "phase": 3, "order": 5, "estimated_minutes": 30},
                {"title": "Custom Kubernetes Operators", "description": "Operator pattern, kubebuilder, reconciliation loop.", "phase": 3, "order": 6, "estimated_minutes": 35},
            ],
        },

        # ── 12  DevOps Capstone ───────────────────────────────────
        {
            "label": "DevOps Capstone Project",
            "description": "Build a production-grade infrastructure from scratch: IaC, CI/CD, containers, K8s, monitoring, and security — all integrated.",
            "market_value": "High",
            "node_type": "core",
            "connections": [],
            "project_prompt": "Build a complete production environment: Terraform-provisioned cloud infra, Kubernetes cluster, CI/CD pipeline, monitoring stack, and security hardening.",
            "resources": {
                "primary": [
                    {"title": "Cloud Resume Challenge", "url": "https://cloudresumechallenge.dev/", "type": "interactive"},
                    {"title": "DevOps Roadmap", "url": "https://roadmap.sh/devops", "type": "docs"},
                ],
                "additional": [
                    {"title": "90 Days of DevOps", "url": "https://github.com/MichaelCade/90DaysOfDevOps", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Project Planning & Architecture", "description": "Design a production architecture, document decisions.", "phase": 1, "order": 1, "estimated_minutes": 40},
                {"title": "Infrastructure Provisioning", "description": "Terraform: VPC, subnets, K8s cluster, databases.", "phase": 1, "order": 2, "estimated_minutes": 50},
                {"title": "Application Deployment", "description": "Dockerize app, Helm chart, K8s manifests, GitOps.", "phase": 2, "order": 3, "estimated_minutes": 45},
                {"title": "CI/CD Pipeline", "description": "Build, test, scan, deploy — automated end-to-end.", "phase": 2, "order": 4, "estimated_minutes": 45},
                {"title": "Observability Stack", "description": "Prometheus, Grafana, Loki, alerts, dashboards.", "phase": 3, "order": 5, "estimated_minutes": 40},
                {"title": "Security & Documentation", "description": "Harden, scan, RBAC, write runbooks, record demo.", "phase": 3, "order": 6, "estimated_minutes": 40},
            ],
        },

        # ── 13  Communication & Career Skills ─────────────────────
        {
            "label": "Communication & Career Skills",
            "description": "Technical excellence isn't enough. Learn to write documentation, give incident updates, collaborate across teams, and navigate the DevOps job market.",
            "market_value": "Med",
            "node_type": "soft_skill",
            "connections": [12],
            "project_prompt": "Write a technical blog post about a DevOps topic, create a runbook for an incident, and present a project architecture to a non-technical audience.",
            "resources": {
                "primary": [
                    {"title": "Technical Writing (Google)", "url": "https://developers.google.com/tech-writing", "type": "docs"},
                    {"title": "The Phoenix Project (book summary)", "url": "https://www.youtube.com/watch?v=uBIpEjCGEfc", "type": "video"},
                ],
                "additional": [
                    {"title": "STAR Method for Interviews", "url": "https://www.themuse.com/advice/star-interview-method", "type": "docs"},
                    {"title": "DevOps Interview Questions", "url": "https://roadmap.sh/questions/devops", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Writing Runbooks & Docs", "description": "Clear operational documentation, decision records, ADRs.", "phase": 1, "order": 1, "estimated_minutes": 25},
                {"title": "Incident Communication", "description": "Status pages, stakeholder updates, executive summaries.", "phase": 1, "order": 2, "estimated_minutes": 20},
                {"title": "Cross-Team Collaboration", "description": "Working with developers, product, security, SLA discussions.", "phase": 2, "order": 3, "estimated_minutes": 20},
                {"title": "Technical Presentations", "description": "Architecture diagrams, demo-driven presentations.", "phase": 2, "order": 4, "estimated_minutes": 25},
                {"title": "DevOps Interview Prep", "description": "System design, scenario questions, hands-on labs.", "phase": 3, "order": 5, "estimated_minutes": 30},
                {"title": "Building Your DevOps Brand", "description": "GitHub, blog, contributions, certifications roadmap.", "phase": 3, "order": 6, "estimated_minutes": 20},
                {"title": "DevOps Culture & Mindset", "description": "Three Ways, continuous improvement, blameless culture.", "phase": 3, "order": 7, "estimated_minutes": 20},
            ],
        },
    ],
}
