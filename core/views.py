from rest_framework import generics
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import RegisterSerializer
from .ai_logic import generate_detailed_roadmap

# 1. REGISTER (Public)
class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

# 2. GET MY ROADMAP (Private - JWT Required)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_my_roadmap(request):
    """
    Fetches the roadmap based on the logged-in user's profile.
    """
    user = request.user
    
    # Use user's saved data
    niche = user.target_career
    uni_course = user.normalized_course or user.university_course_raw
    budget = user.budget_preference

    # Generate Graph
    graph_data = generate_detailed_roadmap(niche, uni_course, budget)
    
    return Response(graph_data)