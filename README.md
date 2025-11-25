# WHATS-NEXT

**AI-powered personalized learning roadmaps for aspiring tech professionals.**

At its core, WHATS-NEXT is a platform that helps students and career-changers build step-by-step learning paths toward their dream tech careers. It generates personalized roadmaps, links to real learning resources, guides project-based learning, and connects learners with the job market.

## Quick Start

### Backend
```bash
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

See **Getting Started** section below for detailed instructions.

## Key Features

### 🎯 **Personalized AI Roadmaps**
- AI generates custom career roadmaps based on your target role and university course
- Smart course normalization using LLM
- Modules include specific projects, resources, and learning outcomes
- Bridge modules that connect your degree to your career goals

### 📚 **Learning Resources**
- Integrated YouTube tutorial search for each module
- Tech news and trends relevant to your career path
- Job opportunities and internship listings
- External resource curation (Udemy, Coursera, docs, etc.)

### 🏆 **Project-Based Learning**
- Real project submissions with GitHub integration
- Automated project scoring (code quality, repo structure, recent commits)
- Peer review and community verification system
- Reputation points for reviewing others' work

### 📝 **Quizzes & Assessments**
- AI-generated quizzes for each module
- Auto-grading and instant feedback
- Multiple attempts with progress tracking

### 👤 **Portfolio & CV Building**
- Dynamic portfolio built from completed projects
- Exportable HTML portfolio page
- Auto-generated CV from module completions
- GitHub and LinkedIn integration

### 💼 **Job Matching**
- Employer job board with entry-level opportunities
- Skill-based job matching
- Application tracking with match scores

### 🔄 **Career Pivoting**
- Seamlessly switch careers while preserving completed skills
- Smart skill transfer between different paths

### 📊 **Analytics Dashboard**
- Learning progress and completion stats
- Time-to-complete insights
- Quiz performance tracking
- Streak counts and contribution graphs
- Personalized recommendations

---

## Tech Stack

### Backend
- **Framework**: Django 5.2 + Django REST Framework
- **Auth**: JWT (djangorestframework-simplejwt)
- **Task Queue**: Celery + Redis
- **AI**: Google Gemini API (roadmap generation & quizzes)
- **APIs**: YouTube Data API, Google News RSS, WeWorkRemotely RSS
- **Validation**: jsonschema (LLM output validation)
- **Database**: SQLite (dev) / PostgreSQL (production)

### Frontend
- **Framework**: React 18 + Vite
- **Visualization**: D3.js (roadmap path visualization)
- **HTTP**: Axios
- **Animation**: Framer Motion
- **UI Components**: Lucide React (icons), custom styling
- **Export**: html2pdf.js (portfolio/CV export)

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- Redis (for Celery)
- Git

### Backend Setup

1. **Clone and enter project directory:**
```bash
git clone https://github.com/manofval0r/WHATS-NEXT.git
cd WHATS-NEXT
```

2. **Create and activate virtual environment:**
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

3. **Install Python dependencies:**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables:**
```bash
cp .env.example .env
```
Edit `.env` and add your API keys and settings:
```
DJANGO_SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
GEMINI_API_KEY=your-gemini-api-key
YOUTUBE_API_KEY=your-youtube-api-key
CELERY_BROKER_URL=redis://localhost:6379/0
```

5. **Run migrations:**
```bash
python manage.py migrate
```

6. **Create superuser (optional):**
```bash
python manage.py createsuperuser
```

7. **Start Redis (in a separate terminal):**
```bash
redis-server
```

8. **Start Celery worker (in a separate terminal):**
```bash
celery -A whats_next_backend worker -l info
```

9. **Run development server:**
```bash
python manage.py runserver
```

Backend will be available at `http://127.0.0.1:8000/`

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment (optional):**
```bash
cp .env.example .env.local
```
Edit `.env.local` if your backend is running on a different URL:
```
VITE_API_URL=http://127.0.0.1:8000
```

4. **Start development server:**
```bash
npm run dev
```

Frontend will be available at `http://localhost:5173/`

---

## API Endpoints

### Authentication
- `POST /api/register/` - Create new account
- `POST /api/token/` - Login (get JWT tokens)
- `POST /api/token/refresh/` - Refresh access token
- `POST /api/normalize-course/` - Normalize university course name (AI)

### Roadmap & Learning
- `POST /api/my-roadmap/` - Get or generate personalized roadmap
- `GET /api/roadmap-status/<task_id>/` - Check roadmap generation status
- `POST /api/submit-project/<node_id>/` - Submit project for a module
- `GET /api/quiz/<item_id>/` - Get quiz for a module
- `POST /api/quiz/<item_id>/submit/` - Submit quiz answers

### Profile & Portfolio
- `GET /api/profile/` - Get user profile with completed projects
- `POST /api/profile/update-socials/` - Update GitHub/LinkedIn links
- `POST /api/profile/update-cv/<item_id>/` - Edit CV bullet point
- `GET /api/profile/export-html/` - Export portfolio as HTML
- `GET /api/profile/activity/` - Get activity log
- `GET /api/profile/streak/` - Get current streak count

### Community
- `GET /api/community/feed/` - Get community project submissions
- `POST /api/community/verify/<item_id>/` - Verify and give reputation
- `GET /api/analytics/` - Get personal analytics dashboard

### Resources
- `GET /api/resources/` - Get news, videos, and job opportunities

### Career
- `POST /api/pivot-career/` - Switch careers with skill transfer

### Jobs (Employer API)
- `GET /api/employer/jobs/` - Get job listings with skill matching
- `POST /api/employer/apply/<job_id>/` - Apply to a job

---

## Environment Variables Reference

```
# Django
DJANGO_SECRET_KEY          # Secret key for Django (change in production)
DEBUG                      # True/False (should be False in production)
ALLOWED_HOSTS              # Comma-separated hosts (e.g., localhost,127.0.0.1,yourdomain.com)

# Celery
CELERY_BROKER_URL          # Redis connection URL

# External APIs
GEMINI_API_KEY             # Google Gemini API key (for roadmap/quiz generation)
YOUTUBE_API_KEY            # YouTube Data API key
GITHUB_TOKEN               # (Optional) GitHub token for higher rate limits in project scoring

# Frontend
VITE_API_URL               # Backend API base URL (default: http://127.0.0.1:8000)
```

---

## Project Structure

```
WHATS-NEXT/
├── core/                   # Django app
│   ├── models.py           # Database models
│   ├── views.py            # API endpoints
│   ├── serializers.py      # DRF serializers
│   ├── ai_logic.py         # AI roadmap generation & LLM logic
│   ├── project_scoring.py  # GitHub project validation & scoring
│   ├── portfolio_generator.py # HTML portfolio generation
│   ├── youtube_logic.py    # YouTube API integration
│   ├── news_logic.py       # RSS news & jobs fetching
│   ├── tasks.py            # Celery async tasks
│   └── tests.py            # Unit tests (to be expanded)
│
├── whats_next_backend/     # Django project config
│   ├── settings.py         # Django settings
│   ├── urls.py             # URL routing
│   ├── wsgi.py             # WSGI config
│   └── celery.py           # Celery config
│
├── frontend/               # React app
│   ├── src/
│   │   ├── api.js          # Axios instance with configurable base URL
│   │   ├── App.jsx         # Main app component
│   │   ├── AuthPage.jsx    # Signup/login
│   │   ├── Dashboard.jsx   # Roadmap visualization
│   │   ├── RoadmapMap.jsx  # D3 roadmap renderer
│   │   ├── Profile.jsx     # Portfolio & CV
│   │   ├── Community.jsx   # Project verification
│   │   ├── Resources.jsx   # News/videos/jobs
│   │   ├── Settings.jsx    # Preferences & career pivot
│   │   ├── ContributionGraph.jsx # Streak visualization
│   │   └── CustomNode.jsx  # Roadmap node component
│   └── vite.config.js      # Vite config
│
├── manage.py               # Django management
├── requirements.txt        # Python dependencies
├── .env.example            # Environment variables template
├── db.sqlite3              # Development database
└── README.md               # This file
```

---

## Key Improvements (Implemented Nov 2025)

✅ **Security & Configuration**
- Removed hardcoded secrets; moved to environment variables
- Input validation for project submissions and quiz answers
- JSON schema validation for LLM outputs with fallback handling
- Safe JSON parsing with error recovery

✅ **Developer Experience**
- Configurable API base URL for frontend (multi-environment support)
- `.env.example` with full setup instructions
- Fixed pivot-career endpoint mismatch

✅ **Features Implemented**
- Smart university course normalization (AI-powered)
- Automated GitHub project scoring (validation, commit history, tests)
- Portfolio HTML export
- Comprehensive analytics dashboard with recommendations
- Employer job board with skill-based matching

---

## Contributing

Contributions are welcome! Please:
1. Create a feature branch (`git checkout -b feature/your-feature`)
2. Commit changes (`git commit -am 'Add feature'`)
3. Push to branch (`git push origin feature/your-feature`)
4. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ to help aspiring tech professionals accelerate their careers.**
