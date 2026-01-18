"""
Certificate Generator (Phase 3)
===============================
Generates HTML certificates for verified project completions.
Designed for on-demand generation and client-side PDF conversion.
"""

from datetime import datetime


def generate_certificate_html(certificate, user, roadmap_item):
    """
    Generate a styled HTML certificate that can be converted to PDF client-side.
    
    Args:
        certificate: Certificate model instance
        user: User model instance
        roadmap_item: UserRoadmapItem model instance
    
    Returns:
        str: Complete HTML document as a string
    """
    
    # Format the date
    issue_date = certificate.issued_at.strftime("%B %d, %Y")
    
    # Get score breakdown for display
    checks_passed = 0
    total_checks = 0
    if certificate.score_breakdown and 'checks' in certificate.score_breakdown:
        for check_name, check_data in certificate.score_breakdown['checks'].items():
            total_checks += 1
            if check_data.get('passed', False):
                checks_passed += 1
    
    # Determine skill level based on score
    skill_level = "Foundation"
    if certificate.github_score >= 90:
        skill_level = "Expert"
    elif certificate.github_score >= 75:
        skill_level = "Advanced"
    elif certificate.github_score >= 60:
        skill_level = "Proficient"
    
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate - {certificate.certificate_id}</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #0a0015 0%, #1a0030 50%, #0d001f 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 40px;
        }}
        
        .certificate {{
            width: 800px;
            background: linear-gradient(180deg, rgba(20, 10, 40, 0.95) 0%, rgba(10, 5, 25, 0.98) 100%);
            border: 2px solid rgba(95, 245, 255, 0.3);
            border-radius: 20px;
            padding: 60px;
            position: relative;
            overflow: hidden;
            box-shadow: 
                0 0 60px rgba(95, 245, 255, 0.15),
                0 0 120px rgba(167, 139, 250, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }}
        
        .certificate::before {{
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #5ff5ff, #a78bfa, #ff2e88, #ffbe0b, #5ff5ff);
            background-size: 200% 100%;
        }}
        
        .corner-accent {{
            position: absolute;
            width: 100px;
            height: 100px;
            border: 2px solid rgba(95, 245, 255, 0.2);
        }}
        
        .corner-accent.top-left {{
            top: 20px;
            left: 20px;
            border-right: none;
            border-bottom: none;
        }}
        
        .corner-accent.top-right {{
            top: 20px;
            right: 20px;
            border-left: none;
            border-bottom: none;
        }}
        
        .corner-accent.bottom-left {{
            bottom: 20px;
            left: 20px;
            border-right: none;
            border-top: none;
        }}
        
        .corner-accent.bottom-right {{
            bottom: 20px;
            right: 20px;
            border-left: none;
            border-top: none;
        }}
        
        .header {{
            text-align: center;
            margin-bottom: 40px;
        }}
        
        .logo {{
            font-family: 'Orbitron', monospace;
            font-size: 24px;
            font-weight: 900;
            color: #5ff5ff;
            letter-spacing: 4px;
            margin-bottom: 10px;
            text-shadow: 0 0 20px rgba(95, 245, 255, 0.5);
        }}
        
        .subtitle {{
            font-size: 12px;
            color: rgba(255, 255, 255, 0.5);
            letter-spacing: 3px;
            text-transform: uppercase;
        }}
        
        .main-title {{
            font-family: 'Orbitron', monospace;
            font-size: 42px;
            font-weight: 700;
            color: white;
            text-align: center;
            margin: 40px 0 20px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }}
        
        .recipient {{
            text-align: center;
            margin: 30px 0;
        }}
        
        .recipient-label {{
            font-size: 14px;
            color: rgba(255, 255, 255, 0.6);
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }}
        
        .recipient-name {{
            font-family: 'Orbitron', monospace;
            font-size: 36px;
            font-weight: 700;
            color: #5ff5ff;
            text-shadow: 0 0 30px rgba(95, 245, 255, 0.4);
        }}
        
        .achievement {{
            text-align: center;
            margin: 40px 0;
            padding: 30px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }}
        
        .achievement-label {{
            font-size: 12px;
            color: rgba(255, 255, 255, 0.5);
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 15px;
        }}
        
        .module-name {{
            font-size: 28px;
            font-weight: 600;
            color: white;
            margin-bottom: 10px;
        }}
        
        .module-description {{
            font-size: 14px;
            color: rgba(255, 255, 255, 0.7);
            line-height: 1.6;
            max-width: 500px;
            margin: 0 auto;
        }}
        
        .stats {{
            display: flex;
            justify-content: center;
            gap: 60px;
            margin: 40px 0;
        }}
        
        .stat {{
            text-align: center;
        }}
        
        .stat-value {{
            font-family: 'Orbitron', monospace;
            font-size: 36px;
            font-weight: 700;
            color: #a78bfa;
            text-shadow: 0 0 20px rgba(167, 139, 250, 0.4);
        }}
        
        .stat-value.score {{
            color: #5ff5ff;
        }}
        
        .stat-label {{
            font-size: 11px;
            color: rgba(255, 255, 255, 0.5);
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-top: 8px;
        }}
        
        .footer {{
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 50px;
            padding-top: 30px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }}
        
        .certificate-id {{
            font-family: 'Orbitron', monospace;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.4);
            letter-spacing: 1px;
        }}
        
        .issue-date {{
            font-size: 14px;
            color: rgba(255, 255, 255, 0.6);
        }}
        
        .verification-badge {{
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: rgba(46, 160, 67, 0.2);
            border: 1px solid rgba(46, 160, 67, 0.4);
            border-radius: 20px;
            color: #2ea043;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
        }}
        
        .verification-badge::before {{
            content: '✓';
            font-size: 14px;
        }}
        
        .skill-level {{
            display: inline-block;
            padding: 6px 16px;
            background: linear-gradient(135deg, rgba(167, 139, 250, 0.2), rgba(95, 245, 255, 0.2));
            border: 1px solid rgba(167, 139, 250, 0.3);
            border-radius: 20px;
            color: #a78bfa;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 15px;
        }}
        
        @media print {{
            body {{
                background: white;
                padding: 0;
            }}
            .certificate {{
                box-shadow: none;
                border: 2px solid #333;
            }}
        }}
    </style>
</head>
<body>
    <div class="certificate">
        <div class="corner-accent top-left"></div>
        <div class="corner-accent top-right"></div>
        <div class="corner-accent bottom-left"></div>
        <div class="corner-accent bottom-right"></div>
        
        <div class="header">
            <div class="logo">WHATS-NEXT</div>
            <div class="subtitle">Verified Achievement Certificate</div>
        </div>
        
        <h1 class="main-title">Certificate of Completion</h1>
        
        <div class="recipient">
            <div class="recipient-label">This certifies that</div>
            <div class="recipient-name">{user.username}</div>
        </div>
        
        <div class="achievement">
            <div class="achievement-label">Has successfully completed</div>
            <div class="module-name">{roadmap_item.label}</div>
            <div class="module-description">{roadmap_item.description[:200]}{'...' if len(roadmap_item.description) > 200 else ''}</div>
            <div class="skill-level">{skill_level} Level</div>
        </div>
        
        <div class="stats">
            <div class="stat">
                <div class="stat-value score">{certificate.github_score}</div>
                <div class="stat-label">Verification Score</div>
            </div>
            <div class="stat">
                <div class="stat-value">{checks_passed}/{total_checks}</div>
                <div class="stat-label">Checks Passed</div>
            </div>
            <div class="stat">
                <div class="stat-value">{certificate.peer_verifications}</div>
                <div class="stat-label">Peer Reviews</div>
            </div>
        </div>
        
        <div class="footer">
            <div>
                <div class="certificate-id">ID: {certificate.certificate_id}</div>
                <div class="issue-date">Issued: {issue_date}</div>
            </div>
            <div class="verification-badge">GitHub Verified</div>
        </div>
    </div>
</body>
</html>"""
    
    return html
