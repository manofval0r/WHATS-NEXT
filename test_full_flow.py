import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'whats_next_backend.settings')
django.setup()

from core.models import User, UserRoadmapItem

user = User.objects.first()
if user:
    # Clear old roadmap
    UserRoadmapItem.objects.filter(user=user).delete()
    print(f"Cleared existing roadmap items for {user.username}")
    
    # Import and test the endpoint logic
    from core.ai_logic import generate_detailed_roadmap
    
    niche = user.target_career or 'Software Development'
    uni_course = user.normalized_course or user.university_course_raw or 'Self-taught'
    budget = user.budget_preference or 'free'
    
    print(f"\nGenerating roadmap for: {niche}, {uni_course}, {budget}")
    modules = generate_detailed_roadmap(niche, uni_course, budget)
    print(f"\n✅ Generated {len(modules)} modules")
    
    # Save to database (simulating what the endpoint does)
    for i, module in enumerate(modules):
        item = UserRoadmapItem.objects.create(
            user=user,
            step_order=i,
            label=module.get('label', 'Module'),
            description=module.get('description', ''),
            status='active' if i == 0 else 'locked',
            market_value=module.get('market_value', 'Med'),
            resources=module.get('resources', {}),
            project_prompt=module.get('project_prompt', '')
        )
    
    print(f"✅ Saved all {len(modules)} modules to database")
    
    # Verify they're in the database
    count = UserRoadmapItem.objects.filter(user=user).count()
    print(f"✅ Database now has {count} roadmap items")
