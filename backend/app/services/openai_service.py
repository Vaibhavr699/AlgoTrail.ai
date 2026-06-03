from openai import AsyncOpenAI

from app.config import get_settings

_client: AsyncOpenAI | None = None


def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        settings = get_settings()
        _client = AsyncOpenAI(api_key=settings.openai_api_key)
    return _client


def _model() -> str:
    return get_settings().openai_model


async def generate_study_path(
    topics: list[dict],
    progress: list[dict],
    goal: str = "MAANG interview prep",
    weeks: int = 8,
) -> dict:
    topics_summary = "\n".join(
        f"- {t['title']} ({t['estimated_days']}d): {', '.join(t.get('patterns', []))}"
        for t in topics
    )

    solved_ids = {p["question_id"] for p in progress if p["status"] == "SOLVED"}
    total_questions = sum(len(t.get("questions", [])) for t in topics)
    total_solved = len(solved_ids)

    by_topic = {}
    for p in progress:
        tid = p.get("topic_id", "unknown")
        by_topic.setdefault(tid, {"solved": 0, "total": 0})
        if p["status"] == "SOLVED":
            by_topic[tid]["solved"] += 1

    progress_summary = (
        f"Solved {total_solved}/{total_questions} total.\n"
        + "\n".join(f"- Topic {tid}: {v['solved']} solved" for tid, v in by_topic.items())
    )

    prompt = f"""You are a DSA study-path advisor. Generate a personalized week-by-week study plan.

GOAL: {goal}
TIMELINE: {weeks} weeks
AVAILABLE TOPICS:
{topics_summary}

CURRENT PROGRESS:
{progress_summary}

Generate a structured JSON study plan with this exact format:
{{
  "title": "Your Personalized DSA Study Path",
  "summary": "Brief overview of the plan",
  "weeks": [
    {{
      "week": 1,
      "theme": "Week theme",
      "topics": ["topic-slug-1", "topic-slug-2"],
      "daily_hours": 2,
      "focus_areas": ["specific patterns or concepts"],
      "tips": "Week-specific advice"
    }}
  ],
  "daily_routine": {{
    "warmup": "What to do first",
    "main_practice": "Core practice approach",
    "review": "End-of-day review strategy"
  }},
  "advice": "Overall strategic advice based on their progress"
}}

Prioritize weak areas (topics with few or no solved problems). Put foundational topics (arrays, strings, hashmaps) early. Place advanced topics (dynamic programming, graphs) later. Be specific about which patterns to focus on each week."""

    client = _get_client()
    response = await client.chat.completions.create(
        model=_model(),
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0.7,
    )
    import json
    return json.loads(response.choices[0].message.content)


async def generate_hint(
    question_title: str,
    question_difficulty: str,
    question_pattern: str,
    hint_level: int = 1,
    existing_hint: str | None = None,
) -> dict:
    level_descriptions = {
        1: "Give a gentle nudge — mention the general approach or data structure to consider without revealing the algorithm. One or two sentences max.",
        2: "Give a medium hint — describe the algorithmic approach at a high level. Mention the key insight but don't give pseudocode.",
        3: "Give a strong hint — provide step-by-step thinking and pseudocode outline, but don't write the full solution.",
    }

    level_desc = level_descriptions.get(hint_level, level_descriptions[1])

    prompt = f"""You are a DSA tutor helping a student who is stuck on a problem.

PROBLEM: {question_title}
DIFFICULTY: {question_difficulty}
PATTERN: {question_pattern}
{"EXISTING HINT (already shown to user): " + existing_hint if existing_hint else ""}

HINT LEVEL {hint_level}/3: {level_desc}

Respond in JSON format:
{{
  "hint": "Your hint text here",
  "level": {hint_level},
  "key_concept": "The main concept they should review",
  "complexity_target": "Expected time/space complexity"
}}"""

    client = _get_client()
    response = await client.chat.completions.create(
        model=_model(),
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0.5,
    )
    import json
    return json.loads(response.choices[0].message.content)


async def explain_solution(
    question_title: str,
    question_difficulty: str,
    question_pattern: str,
    language: str = "python",
) -> dict:
    prompt = f"""You are a DSA tutor explaining how to solve a coding problem.

PROBLEM: {question_title}
DIFFICULTY: {question_difficulty}
PATTERN: {question_pattern}
LANGUAGE: {language}

Provide a clear, educational explanation in JSON format:
{{
  "approach": "Name of the approach (e.g., Two Pointer, Sliding Window)",
  "intuition": "Why this approach works — the key insight",
  "steps": ["Step 1 description", "Step 2 description", ...],
  "code": "Clean, well-commented solution code in {language}",
  "time_complexity": "O(...) with explanation",
  "space_complexity": "O(...) with explanation",
  "common_mistakes": ["Mistake 1", "Mistake 2"],
  "follow_up": "How to extend this to harder variants"
}}"""

    client = _get_client()
    response = await client.chat.completions.create(
        model=_model(),
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0.3,
    )
    import json
    return json.loads(response.choices[0].message.content)


async def teach_pattern(pattern_name: str, topic_context: str | None = None) -> dict:
    context_line = f"\nTOPIC CONTEXT: This pattern is commonly used in {topic_context} problems." if topic_context else ""

    prompt = f"""You are a world-class DSA tutor. Teach the following algorithmic pattern in depth.

PATTERN: {pattern_name}{context_line}

Provide a comprehensive, educational lesson in JSON format:
{{
  "pattern_name": "{pattern_name}",
  "summary": "One-line description of what this pattern does",
  "when_to_use": "Clear signals/cues that tell you this pattern applies — what does the problem look like?",
  "how_it_works": "Step-by-step explanation of the core mechanism (3-5 steps)",
  "template": "A clean, reusable pseudocode/code template in Python that can be adapted to many problems",
  "time_complexity": "Typical time complexity with explanation",
  "space_complexity": "Typical space complexity with explanation",
  "classic_examples": [
    {{
      "problem": "Problem name",
      "why": "Why this pattern applies here"
    }}
  ],
  "common_mistakes": ["Mistake 1", "Mistake 2"],
  "pro_tips": ["Tip 1", "Tip 2"],
  "related_patterns": ["Pattern 1", "Pattern 2"]
}}

Be specific and practical. The student should walk away able to recognize and apply this pattern."""

    client = _get_client()
    response = await client.chat.completions.create(
        model=_model(),
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0.4,
    )
    import json
    return json.loads(response.choices[0].message.content)


async def regenerate_template(pattern_name: str, language: str) -> dict:
    prompt = f"""Rewrite the following algorithmic pattern template in {language}.

PATTERN: {pattern_name}

Return JSON with exactly:
{{
  "template": "A clean, reusable code template in {language} for the {pattern_name} pattern. Include brief inline comments. Make it practical and adaptable.",
  "language": "{language}"
}}"""

    client = _get_client()
    response = await client.chat.completions.create(
        model=_model(),
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0.3,
    )
    import json
    return json.loads(response.choices[0].message.content)


async def explain_problem_visual(
    title: str,
    difficulty: str,
    content: str,
    tags: list[str],
) -> dict:
    tag_line = ", ".join(tags) if tags else "unknown"
    trimmed = (content or "")[:4000]

    prompt = f"""You are Aria, a friendly DSA tutor. A student pasted a LeetCode problem they don't understand. Explain it so a beginner truly gets it, and produce a STEP-BY-STEP visual trace of the OPTIMAL algorithm running on the problem's first example.

PROBLEM: {title}
DIFFICULTY: {difficulty}
TOPIC TAGS: {tag_line}
STATEMENT (HTML, usually includes worked examples):
{trimmed}

Return JSON with EXACTLY this shape:
{{
  "tldr": "One plain sentence: what is this problem really asking?",
  "intuition": "2-4 sentences of plain-English intuition for the optimal approach.",
  "pattern": "The main technique, e.g. 'Hash Map' or 'Two Pointers'.",
  "example_input": "The concrete example input you trace (from the statement if present, else a small one you pick).",
  "steps": [
    {{
      "title": "Short step label",
      "explanation": "What happens this step and WHY, in plain English.",
      "state": "A compact MONOSPACE snapshot of the data-structure state AFTER this step. Align arrays in columns, mark pointers with ^, show map/stack/queue contents. <= 8 lines, <= 56 chars per line."
    }}
  ],
  "time_complexity": "O(...) — short reason",
  "space_complexity": "O(...) — short reason",
  "edge_cases": ["edge case 1", "edge case 2"]
}}

Rules:
- 4 to 8 steps, tracing the OPTIMAL solution (not brute force) on example_input.
- "state" is rendered in a monospace box — make it visually clear and aligned.
- Teach UNDERSTANDING; do NOT dump the full solution code."""

    client = _get_client()
    response = await client.chat.completions.create(
        model=_model(),
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0.3,
    )
    import json
    return json.loads(response.choices[0].message.content)


async def chat_about_pattern(
    pattern_name: str,
    conversation: list[dict],
) -> str:
    system_msg = f"""You are Aria, a friendly and knowledgeable female DSA tutor on AlgoTrail.ai.
You are helping a student understand the "{pattern_name}" pattern.

Rules:
- Be concise but thorough. Use examples when helpful.
- If they ask about code, write in Python unless they specify another language.
- If they ask something unrelated to DSA, gently redirect them.
- Use a warm, encouraging tone. You want them to succeed.
- When explaining, connect concepts to things they likely already know."""

    messages = [{"role": "system", "content": system_msg}] + conversation

    client = _get_client()
    response = await client.chat.completions.create(
        model=_model(),
        messages=messages,
        temperature=0.6,
        max_tokens=800,
    )
    return response.choices[0].message.content
