"""
JADA, the AI tutor.

Moved out of core/views.py.
"""

from core.api._base import *  # noqa: F401,F403

JADA_SYSTEM_PROMPT = (
    "You are JADA — a friendly, confident AI career coach for aspiring developers. "
    "Keep answers concise (under 200 words unless asked for detail). "
    "Reference the user's current module and progress when possible. "
    "Be decisive — give clear recommendations rather than asking follow-up questions. "
    "Only ask a question when you genuinely need information you cannot infer. "
    "Default to giving actionable advice, not asking what the user wants. "
    "Use code blocks with language tags when showing code. "
    "Never make up URLs or resources.\n\n"
    "FORMATTING RULES (you are rendering in a chat bubble with markdown support):\n"
    "- Use ### for section headings (never # or ##, they are too large).\n"
    "- Use **bold** for emphasis and key terms.\n"
    "- Use - for bullet lists, 1. for numbered steps.\n"
    "- Keep tables simple and small (max 3-4 columns). Prefer bullet lists over tables when possible.\n"
    "- Use short paragraphs (2-3 sentences max per paragraph).\n"
    "- Separate sections with a blank line, never use --- horizontal rules.\n\n"
    "INTERACTIVE QUESTION FORMAT — use these markers ONLY when you need the user to make a real choice:\n"
    "Do NOT use interactive markers for rhetorical questions or when you can make the decision yourself.\n"
    "When you want the user to pick ONE option, write:\n"
    "[SINGLE_SELECT]\n"
    "Question text here\n"
    "1. **Option label** - Optional description\n"
    "2. **Option label** - Optional description\n\n"
    "When the user should pick MULTIPLE options, write:\n"
    "[MULTI_SELECT]\n"
    "Question text here\n"
    "1. **Option label** - Optional description\n\n"
    "For true/false questions, write:\n"
    "[TRUE_FALSE]\n"
    "Statement to evaluate here\n\n"
    "QUIZ FORMAT — when the user explicitly asks for a quiz, use:\n"
    "[QUIZ_START] Quiz Title Here\n"
    "[QUIZ_Q1]\n"
    "[SINGLE_SELECT]\n"
    "Question text\n"
    "1. Option A\n"
    "2. Option B\n"
    "[QUIZ_Q2]\n"
    "[TRUE_FALSE]\n"
    "Statement\n"
    "[QUIZ_END]\n\n"
    "Only use quiz format when the user asks for a quiz or assessment. "
    "For regular questions, default to giving answers, not asking more questions.\n"
)


CONSULTANT_SYSTEM_PROMPT = (
    "You are JADA — an expert AI Career Consultant helping people discover the perfect tech career path. "
    "You are warm, insightful, and decisive. You listen carefully, then give confident recommendations.\n\n"
    "YOUR APPROACH:\n"
    "1. Start with a brief, friendly greeting and ask ONE focused question about the user's background "
    "   (e.g., what they studied, what interests them, any coding experience).\n"
    "2. Based on their answer, ask ONE more question to narrow down (e.g., do they prefer building things "
    "   people see, working with data, or solving infrastructure problems?).\n"
    "3. After 2-3 exchanges maximum, give a CONFIDENT recommendation with a specific career path.\n"
    "4. Do NOT keep asking questions endlessly. Be decisive after gathering minimal context.\n\n"
    "RECOMMENDATION FORMAT (use after gathering enough info):\n"
    "[CAREER_RECOMMENDATION]\n"
    "### Your Recommended Path: {Role Name}\n"
    "**Why this fits you**: 2-3 sentences explaining the match.\n"
    "**What you'll learn**: Key technologies and skills.\n"
    "**Career outlook**: Salary range and demand level.\n"
    "**Time to job-ready**: Estimated months.\n\n"
    "IMPORTANT RULES:\n"
    "- You are NOT limited to predefined roles. Recommend ANY tech career that fits "
    "  (e.g., AI Prompt Engineer, Cloud Security Analyst, Blockchain Developer, Technical Writer, "
    "  Data Engineer, DevRel, QA Automation, etc.).\n"
    "- If the user's background suggests a non-standard path, recommend it confidently.\n"
    "- Always explain WHY the path fits their specific background and interests.\n"
    "- If someone has no tech background, suggest beginner-friendly paths and explain the transition.\n"
    "- Keep answers concise. Max 3 questions before recommending.\n"
    "- Use the same formatting rules as general JADA (###, **bold**, bullet lists, short paragraphs).\n"
    "- After recommending, offer: 'Want me to generate a personalized roadmap for this path?'\n"
)


JADA_CASUAL_CASCADE = ["cohere/north-mini-code:free"] + [
    m for m in FREE_MODEL_CASCADE if m != "cohere/north-mini-code:free"
]


JADA_TECHNICAL_CASCADE = list(FREE_MODEL_CASCADE)


JADA_ALLOWED_MODELS = {"auto", "gemini", *JADA_CASUAL_CASCADE, *JADA_TECHNICAL_CASCADE}


GUEST_MESSAGE_LIMIT = 20


JADA_DEGRADED_REPLY = (
    "I'm temporarily unable to reach my model providers, so I can't answer "
    "that right now. Nothing was sent to a third party. Try again in a "
    "moment — the free tier this runs on is occasionally rate limited."
)


def _parse_option_line(line: str):
    """Parse '1. **Label** - Description' or '1. Label' into {label, description}."""
    import re
    cleaned = re.sub(r'^\s*\d+\.\s*', '', line).strip()
    # Try **bold label** - description
    m = re.match(r'\*\*(.+?)\*\*\s*[-–—]\s*(.+)', cleaned)
    if m:
        return {'label': m.group(1).strip(), 'description': m.group(2).strip()}
    # Try bold label without description
    m = re.match(r'\*\*(.+?)\*\*', cleaned)
    if m:
        return {'label': m.group(1).strip(), 'description': ''}
    # Plain text — check for dash separator
    if ' - ' in cleaned:
        parts = cleaned.split(' - ', 1)
        return {'label': parts[0].strip(), 'description': parts[1].strip()}
    return {'label': cleaned, 'description': ''}


def _extract_interactive(reply: str):
    """Extract structured interactive questions from LLM reply.

    Detects [SINGLE_SELECT], [MULTI_SELECT], [TRUE_FALSE] markers.
    Returns (interactive_data_or_None, clean_reply).
    interactive_data = {type, question_text, options: [{label, description}], include_other}
    """
    import re

    # Match [SINGLE_SELECT] or [MULTI_SELECT] block
    select_pattern = re.compile(
        r'(?P<before>[\s\S]*?)'
        r'\[(?P<type>SINGLE_SELECT|MULTI_SELECT)\]\s*\n'
        r'(?P<question>.+?)\n'
        r'(?P<opts>(?:\s*\d+\.\s+.+\n?){2,})'
        r'(?P<after>[\s\S]*?)$',
        re.IGNORECASE,
    )
    m = select_pattern.match(reply)
    if m:
        q_type = 'single' if 'SINGLE' in m.group('type').upper() else 'multi'
        question_text = m.group('question').strip()
        opts_raw = m.group('opts')
        options = [
            _parse_option_line(line)
            for line in opts_raw.strip().splitlines()
            if line.strip()
        ]
        clean = (m.group('before').rstrip() + '\n' + m.group('after').strip()).strip()
        return {
            'type': q_type,
            'question_text': question_text,
            'options': options,
            'include_other': True,
        }, clean

    # Match [TRUE_FALSE] block
    tf_pattern = re.compile(
        r'(?P<before>[\s\S]*?)'
        r'\[TRUE_FALSE\]\s*\n'
        r'(?P<statement>.+?)'
        r'(?:\n(?P<after>[\s\S]*))?$',
        re.IGNORECASE,
    )
    m = tf_pattern.match(reply)
    if m:
        statement = m.group('statement').strip()
        after = (m.group('after') or '').strip()
        clean = (m.group('before').rstrip() + ('\n' + after if after else '')).strip()
        return {
            'type': 'boolean',
            'question_text': statement,
            'options': [
                {'label': 'True', 'description': ''},
                {'label': 'False', 'description': ''},
            ],
            'include_other': False,
        }, clean

    # Legacy fallback: 'Choose one:' pattern
    trigger = r'(?:Choose one|Pick an option|Select one|Which would you prefer)[:\s]*'
    legacy_pattern = re.compile(
        r'(?P<before>[\s\S]*?)'
        rf'(?:{trigger})\s*\n'
        r'(?P<opts>(?:\s*\d+\.\s+.+\n?){2,})'
        r'\s*$',
        re.IGNORECASE,
    )
    m = legacy_pattern.match(reply)
    if m:
        question_text = ''
        # Try to grab last line before trigger as question
        before_text = m.group('before').rstrip()
        before_lines = before_text.splitlines()
        if before_lines and before_lines[-1].strip().endswith('?'):
            question_text = before_lines[-1].strip()
            before_text = '\n'.join(before_lines[:-1]).rstrip()
        opts_raw = m.group('opts')
        options = [
            _parse_option_line(line)
            for line in opts_raw.strip().splitlines()
            if line.strip()
        ]
        if options:
            return {
                'type': 'single',
                'question_text': question_text,
                'options': options,
                'include_other': True,
            }, before_text

    return None, reply


def _extract_quiz(reply: str):
    """Extract structured quiz data from LLM reply with [QUIZ_START]...[QUIZ_END] markers.

    Returns (quiz_data_or_None, clean_reply).
    quiz_data = {title, questions: [{id, type, question_text, options}]}
    """
    import re

    quiz_pattern = re.compile(
        r'(?P<before>[\s\S]*?)'
        r'\[QUIZ_START\]\s*(?P<title>.*)\n'
        r'(?P<body>[\s\S]*?)'
        r'\[QUIZ_END\]'
        r'(?P<after>[\s\S]*?)$',
        re.IGNORECASE,
    )
    m = quiz_pattern.match(reply)
    if not m:
        return None, reply

    title = m.group('title').strip() or 'Quiz'
    body = m.group('body')
    clean = (m.group('before').rstrip() + '\n' + m.group('after').strip()).strip()

    # Split by [QUIZ_QN] markers
    q_parts = re.split(r'\[QUIZ_Q(\d+)\]', body)
    # q_parts: ['before', '1', 'content1', '2', 'content2', ...]
    questions = []
    i = 1
    while i < len(q_parts) - 1:
        q_num = q_parts[i]
        q_content = q_parts[i + 1].strip()
        i += 2

        q_type = 'single'
        if re.search(r'\[SINGLE_SELECT\]', q_content, re.IGNORECASE):
            q_type = 'single'
            q_content = re.sub(r'\[SINGLE_SELECT\]\s*\n?', '', q_content, flags=re.IGNORECASE)
        elif re.search(r'\[MULTI_SELECT\]', q_content, re.IGNORECASE):
            q_type = 'multi'
            q_content = re.sub(r'\[MULTI_SELECT\]\s*\n?', '', q_content, flags=re.IGNORECASE)
        elif re.search(r'\[TRUE_FALSE\]', q_content, re.IGNORECASE):
            q_type = 'boolean'
            q_content = re.sub(r'\[TRUE_FALSE\]\s*\n?', '', q_content, flags=re.IGNORECASE)

        lines = q_content.strip().splitlines()
        question_text = ''
        option_lines = []
        for line in lines:
            if re.match(r'\s*\d+\.\s+', line):
                option_lines.append(line)
            elif not option_lines:
                question_text += (' ' + line.strip()) if question_text else line.strip()

        options = [_parse_option_line(ol) for ol in option_lines] if option_lines else []
        if q_type == 'boolean' and not options:
            options = [{'label': 'True', 'description': ''}, {'label': 'False', 'description': ''}]

        questions.append({
            'id': f'q{q_num}',
            'type': q_type,
            'question_text': question_text,
            'options': options,
        })

    if not questions:
        return None, reply

    return {'title': title, 'questions': questions}, clean


def _classify_complexity(message: str) -> str:
    """Route messages: code/debug/architecture → technical, else casual."""
    technical_keywords = [
        'code', 'debug', 'error', 'function', 'class', 'api', 'deploy',
        'database', 'sql', 'algorithm', 'refactor', 'architecture', 'git',
        'docker', 'test', 'import', 'exception', 'stack trace', 'bug',
        'review my', 'explain this code', 'how to implement',
    ]
    msg_lower = message.lower()
    return "technical" if any(kw in msg_lower for kw in technical_keywords) else "casual"


def _generate_suggestions(user_message: str, reply: str, module=None):
    """Generate 2-4 contextual follow-up question suggestions based on the conversation."""
    suggestions = []

    # Module-aware suggestions
    if module:
        label = module.label or "this module"
        status = module.status or "active"

        if status == "active":
            suggestions.extend([
                f"What are the key concepts in {label}?",
                "What project should I build for this module?",
                "Quiz me on what I've learned so far",
            ])
        elif status == "completed":
            suggestions.extend([
                "What should I learn next?",
                "How can I improve my project score?",
                f"Give me advanced tips for {label}",
            ])
    else:
        suggestions.extend([
            "What should I focus on today?",
            "How's my overall progress?",
            "Recommend a project for me",
        ])

    # Context-reactive suggestions based on reply content
    reply_lower = reply.lower() if reply else ""
    reactive = []
    if "project" in reply_lower or "build" in reply_lower:
        reactive.append("Help me plan this project step by step")
    if "resource" in reply_lower or "learn" in reply_lower:
        reactive.append("What resources do you recommend?")
    if any(w in reply_lower for w in ["code", "function", "class", "```"]):
        reactive.append("Can you explain this code further?")
    if "quiz" in reply_lower or "test" in reply_lower:
        reactive.append("Quiz me on this topic")

    # Merge: reactive first (more relevant), then module-based, cap at 4
    combined = reactive + [s for s in suggestions if s not in reactive]
    return combined[:4]


def _build_jada_context(user, module):
    """Build rich context block for JADA's system prompt including lesson progress."""
    parts = []

    if module:
        parts.insert(0,
            f"IMPORTANT: The user has ALREADY selected their module — '{module.label}'. "
            f"Do NOT ask them which module they are working on. "
            f"Start helping immediately based on this module context. "
            f"You know their module, their progress, and their status — use it."
        )
        parts.append(
            f"User is working on module: {module.label} — {module.description}. "
            f"Status: {module.status}."
        )

        # Lesson progress for this module
        lp_qs = LessonProgress.objects.filter(user=user, roadmap_item=module)
        done = lp_qs.filter(is_completed=True).count()
        total = lp_qs.count()
        if total:
            parts.append(f"Lesson progress: {done}/{total} lessons completed in this module.")
            # List incomplete lessons so JADA can nudge
            incomplete = lp_qs.filter(is_completed=False).values_list('lesson_title', flat=True)[:5]
            if incomplete:
                parts.append(f"Remaining lessons: {', '.join(incomplete)}.")
        else:
            # Use lesson_outline count from resources
            outline = (module.resources or {}).get('lesson_outline') or []
            if outline:
                parts.append(f"Module has {len(outline)} lessons (none started yet).")

        # Quiz info
        quiz = getattr(module, 'quiz', None)
        if quiz:
            parts.append(
                f"Module quiz: {'Passed' if quiz.passed else 'Not passed'} "
                f"(score: {quiz.score}, attempts: {quiz.attempts})."
            )

        # Project submission
        if module.project_submission_link:
            parts.append(f"Project submitted: {module.project_submission_link}")
        else:
            parts.append("Project: Not submitted yet.")

        # Tech debt
        debts = UserTechDebt.objects.filter(user=user, resolved=False)[:3]
        if debts:
            topics = ', '.join(d.topic for d in debts)
            parts.append(f"Skipped topics to revisit: {topics}.")

        # Recent resource clicks
        clicks = ResourceClick.objects.filter(user=user, module=module).order_by('-clicked_at')[:3]
        if clicks:
            titles = ', '.join(c.title[:40] for c in clicks if c.title)
            if titles:
                parts.append(f"Recently viewed resources: {titles}.")

    # Global progress
    completed_count = UserRoadmapItem.objects.filter(user=user, status='completed').count()
    total_count = UserRoadmapItem.objects.filter(user=user).count()
    if total_count:
        parts.append(f"Overall progress: {completed_count}/{total_count} modules completed.")

    return "\n".join(parts)


@api_view(['POST'])
@permission_classes([AllowAny])
def jada_chat(request):
    """
    Send a message to JADA. Uses cascade model routing.
    Supports both authenticated users and guest sessions.
    Body: { message, conversation_id?, mode?, module_id?, preferred_model?, session_id? }
    """
    user = request.user if request.user.is_authenticated else None
    is_guest = user is None
    message = request.data.get('message', '').strip()

    if not message:
        return Response({"error": "Message is required"}, status=400)
    if len(message) > 4000:
        return Response({"error": "Message too long (max 4000 chars)"}, status=400)

    mode = request.data.get('mode', 'general')
    conversation_id = request.data.get('conversation_id')
    module_id = request.data.get('module_id')
    preferred_model = request.data.get('preferred_model', 'auto')
    raw_session = request.data.get('session_id')
    if preferred_model not in JADA_ALLOWED_MODELS:
        preferred_model = 'auto'

    from core.guest_sessions import (
        issue_session,
        looks_like_token,
        sign_session,
        verify_session,
    )

    # Guests must use consultant mode. The session token is signed
    # server-side: a client cannot mint one, so a leaked or guessed value
    # cannot be used to reach another guest's conversation.
    if is_guest:
        mode = 'consultant'
        session_id = verify_session(raw_session)

        if session_id is None:
            if looks_like_token(raw_session):
                # An unsigned legacy UUID, or a forged token. Say so rather
                # than silently minting a fresh session and letting the caller
                # believe they resumed their conversation.
                return Response(
                    {
                        "error": "Session expired or invalid. Reload to start a new one.",
                        "code": "invalid_session",
                    },
                    status=401,
                )
            session_id = None
    else:
        session_id = None

    # Get or create conversation
    conversation = None
    if conversation_id:
        if is_guest:
            # Both halves of the lookup are now server-controlled: the id is
            # the row's, the session is one we issued and verified.
            conversation = JadaConversation.objects.filter(
                id=conversation_id, session_id=session_id, user__isnull=True
            ).first() if session_id else None
            if not conversation:
                return Response({"error": "Conversation not found."}, status=404)
        else:
            conversation = JadaConversation.objects.filter(id=conversation_id, user=user).first()

    if is_guest:
        # Enforce the cap on every guest message, keyed to the verified
        # session. Previously the check was inside `if conversation_id:`,
        # so omitting that field created a brand new conversation each time
        # and the 20-message limit could never be reached.
        guest_messages = JadaMessage.objects.filter(
            conversation__session_id=session_id,
            conversation__user__isnull=True,
            role='user',
        ).count() if session_id else 0

        if guest_messages >= GUEST_MESSAGE_LIMIT:
            return Response({
                "error": (
                    "You have used your guest messages. Create an account to "
                    "keep chatting with JADA."
                ),
                "limit_reached": True,
                "messages_used": guest_messages,
                "messages_allowed": GUEST_MESSAGE_LIMIT,
            }, status=429)

    if not conversation:
        # Resolve module context (only for authenticated users)
        context_module = None
        if not is_guest:
            if module_id:
                context_module = UserRoadmapItem.objects.filter(id=module_id, user=user).first()
            if not context_module:
                context_module = UserRoadmapItem.objects.filter(user=user, status='active').first()
        elif session_id is not None:
            # Reuse this guest's most recent conversation instead of starting a
            # new one per message. Without this, every message minted a fresh
            # row, and the guest accumulated one conversation per question.
            conversation = (
                JadaConversation.objects
                .filter(session_id=session_id, user__isnull=True)
                .order_by('-last_message_at')
                .first()
            )
        else:
            # First message from this guest: mint a session and hand back the
            # signed token. The raw UUID is never exposed to the client.
            session_id = verify_session(issue_session())

        if not conversation:
            conversation = JadaConversation.objects.create(
                user=user,
                session_id=session_id if is_guest else None,
                context_module=context_module,
                mode=mode,
            )
    elif module_id and not is_guest:
        # Update module context if explicitly provided on existing conversation
        new_mod = UserRoadmapItem.objects.filter(id=module_id, user=user).first()
        if new_mod and new_mod != conversation.context_module:
            conversation.context_module = new_mod
            conversation.save(update_fields=['context_module'])

    # Build message history (last 20 messages for context window)
    history = list(conversation.messages.order_by('-created_at')[:20])
    history.reverse()

    # Select system prompt based on mode
    system_prompt = CONSULTANT_SYSTEM_PROMPT if mode == 'consultant' else JADA_SYSTEM_PROMPT
    messages_payload = [{"role": "system", "content": system_prompt}]

    # Rich context injection (only for authenticated users with roadmap data)
    if not is_guest:
        ctx = _build_jada_context(user, conversation.context_module)
        if ctx:
            messages_payload.append({"role": "system", "content": ctx})

    for msg in history:
        messages_payload.append({
            "role": "user" if msg.role == "user" else "assistant",
            "content": msg.content,
        })
    messages_payload.append({"role": "user", "content": message})

    # Route to appropriate model cascade
    complexity = _classify_complexity(message)
    model_cascade = list(JADA_TECHNICAL_CASCADE if complexity == "technical" else JADA_CASUAL_CASCADE)

    # User-selected model: 'gemini' goes direct, specific model gets priority in cascade
    use_gemini_direct = preferred_model == 'gemini'
    if preferred_model and preferred_model not in ('auto', 'gemini'):
        # Put the user's preferred model first, then fall back to the normal cascade
        if preferred_model in model_cascade:
            model_cascade.remove(preferred_model)
        model_cascade.insert(0, preferred_model)

    if use_gemini_direct and os.getenv("GEMINI_API_KEY", "").strip():
        try:
            from core.ai_logic import _call_gemini_text
            reply = _call_gemini_text(
                "\n".join(m["content"] for m in messages_payload),
                temperature=0.7,
                timeout=(5, 30),
            )
            model_used = "gemini"
        except Exception as e2:
            logger.info("[JADA] Gemini direct failed: %s, falling back to cascade", e2)
            try:
                reply, model_used = chat_completions_cascade(
                    messages=messages_payload, models=model_cascade,
                    temperature=0.7, max_tokens=1024, timeout=45,
                )
            except OpenRouterError:
                reply = JADA_DEGRADED_REPLY
                model_used = "error"
    elif use_gemini_direct:
        # Gemini was explicitly requested but is not configured. Say so rather
        # than silently substituting something else.
        try:
            reply, model_used = chat_completions_cascade(
                messages=messages_payload, models=model_cascade,
                temperature=0.7, max_tokens=1024, timeout=45,
            )
        except OpenRouterError:
            reply = JADA_DEGRADED_REPLY
            model_used = "error"
    else:
        try:
            reply, model_used = chat_completions_cascade(
                messages=messages_payload,
                models=model_cascade,
                temperature=0.7,
                max_tokens=1024,
                timeout=45,
            )
        except OpenRouterError as cascade_error:
            # Gemini is a genuine second provider, but only when configured.
            # Attempting it without a key spent 30s on a guaranteed failure.
            if os.getenv("GEMINI_API_KEY", "").strip():
                try:
                    from core.ai_logic import _call_gemini_text
                    reply = _call_gemini_text(
                        "\n".join(m["content"] for m in messages_payload),
                        temperature=0.7,
                        timeout=(5, 30),
                    )
                    model_used = "gemini-fallback"
                except Exception as gemini_error:  # noqa: BLE001
                    logger.warning(
                        "[JADA] every provider failed (%s)", gemini_error
                    )
                    reply = JADA_DEGRADED_REPLY
                    model_used = "error"
            else:
                # No second provider configured. Be honest and specific rather
                # than implying the question was understood.
                logger.info(
                    "[JADA] OpenRouter cascade exhausted and no Gemini key is "
                    "configured; returning degraded reply"
                )
                reply = JADA_DEGRADED_REPLY
                model_used = "error"

    # Extract structured interactive elements from reply
    quiz_data, reply_after_quiz = _extract_quiz(reply)
    interactive_data, clean_reply = _extract_interactive(reply_after_quiz)

    # Persist messages (store the full original reply)
    JadaMessage.objects.create(conversation=conversation, role='user', content=message)
    JadaMessage.objects.create(conversation=conversation, role='jada', content=reply, model_used=model_used)

    # Generate contextual follow-up suggestions
    suggestions = _generate_suggestions(message, reply, conversation.context_module)

    return Response({
        "reply": clean_reply,
        "conversation_id": conversation.id,
        # A signed token, never the raw UUID. The previous version returned
        # conversation.session_id directly, handing every guest the secret
        # that isolates their conversation from every other guest's.
        "session_id": sign_session(conversation.session_id) if is_guest and conversation.session_id else None,
        "model_used": model_used,
        "complexity": complexity,
        "module_id": conversation.context_module_id,
        "module_label": conversation.context_module.label if conversation.context_module else None,
        "suggestions": suggestions,
        "interactive": interactive_data,
        "quiz": quiz_data,
    })


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def jada_switch_context(request, conversation_id):
    """Switch the module context for a Jada conversation."""
    convo = get_object_or_404(JadaConversation, id=conversation_id, user=request.user)
    module_id = request.data.get('module_id')

    if module_id:
        mod = UserRoadmapItem.objects.filter(id=module_id, user=request.user).first()
        if not mod:
            return Response({"error": "Module not found"}, status=404)
        convo.context_module = mod
        convo.save(update_fields=['context_module'])

        # Inject a system message so the conversation history reflects the switch
        JadaMessage.objects.create(
            conversation=convo, role='system',
            content=f"[Context switched to module: {mod.label}]",
        )
        return Response({
            "module_id": mod.id,
            "module_label": mod.label,
        })

    return Response({"error": "module_id is required"}, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def jada_claim_guest(request):
    """
    Claim guest conversations after signup or login.

    Requires a valid *signed* session token, not a bare UUID. Previously any
    authenticated user could claim any guest session that had ever existed,
    given only a 122-bit value that was handed out in plaintext and stored in
    browser localStorage — so leaking your session was losing your history to
    whoever read it.
    """
    from core.guest_sessions import verify_session

    session_id = verify_session(request.data.get('session_id'))
    if not session_id:
        return Response(
            {"error": "Invalid or expired session. Nothing was claimed."},
            status=400,
        )

    claimed = JadaConversation.objects.filter(
        session_id=session_id, user__isnull=True
    ).update(user=request.user)

    return Response({"claimed": claimed})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def jada_conversations(request):
    """List user's JADA conversations."""
    convos = JadaConversation.objects.filter(user=request.user)[:20]
    return Response([
        {
            "id": c.id,
            "mode": c.mode,
            "module": c.context_module.label if c.context_module else None,
            "started_at": c.started_at,
            "last_message_at": c.last_message_at,
            "message_count": c.messages.count(),
        }
        for c in convos
    ])


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def jada_conversation_detail(request, conversation_id):
    """Get all messages in a JADA conversation."""
    convo = get_object_or_404(JadaConversation, id=conversation_id, user=request.user)
    messages = convo.messages.all()
    return Response({
        "id": convo.id,
        "mode": convo.mode,
        "module": convo.context_module.label if convo.context_module else None,
        "messages": [
            {
                "role": m.role,
                "content": m.content,
                "model_used": m.model_used,
                "created_at": m.created_at,
            }
            for m in messages
        ],
    })


__all__ = [
    "CONSULTANT_SYSTEM_PROMPT",
    "GUEST_MESSAGE_LIMIT",
    "JADA_ALLOWED_MODELS",
    "JADA_CASUAL_CASCADE",
    "JADA_DEGRADED_REPLY",
    "JADA_SYSTEM_PROMPT",
    "JADA_TECHNICAL_CASCADE",
    "_build_jada_context",
    "_classify_complexity",
    "_extract_interactive",
    "_extract_quiz",
    "_generate_suggestions",
    "_parse_option_line",
    "jada_chat",
    "jada_claim_guest",
    "jada_conversation_detail",
    "jada_conversations",
    "jada_switch_context",
]
