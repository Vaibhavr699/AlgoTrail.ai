import httpx

LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql"

PROBLEM_DETAIL_QUERY = """
query getQuestionDetail($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId
    title
    titleSlug
    difficulty
    content
    topicTags {
      name
      slug
    }
    stats
    hints
    similarQuestions
    sampleTestCase
    exampleTestcaseList
    categoryTitle
    isPaidOnly
  }
}
"""

PROBLEM_LIST_QUERY = """
query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
  problemsetQuestionList: questionList(
    categorySlug: $categorySlug
    limit: $limit
    skip: $skip
    filters: $filters
  ) {
    total: totalNum
    questions: data {
      questionId
      title
      titleSlug
      difficulty
      topicTags {
        name
        slug
      }
      isPaidOnly
      acRate
      frontendQuestionId: questionFrontendId
    }
  }
}
"""

HEADERS = {
    "Content-Type": "application/json",
    "Referer": "https://leetcode.com",
}


async def fetch_problem_detail(leetcode_slug: str) -> dict | None:
    payload = {
        "query": PROBLEM_DETAIL_QUERY,
        "variables": {"titleSlug": leetcode_slug},
    }
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(LEETCODE_GRAPHQL_URL, json=payload, headers=HEADERS)
        resp.raise_for_status()
        data = resp.json()
    question = data.get("data", {}).get("question")
    if question is None:
        return None
    return question


async def search_problems(
    query: str | None = None,
    difficulty: str | None = None,
    tags: list[str] | None = None,
    limit: int = 20,
    skip: int = 0,
) -> dict:
    filters: dict = {}
    if query:
        filters["searchKeywords"] = query
    if difficulty:
        filters["difficulty"] = difficulty.upper()
    if tags:
        filters["tags"] = tags

    payload = {
        "query": PROBLEM_LIST_QUERY,
        "variables": {
            "categorySlug": "all-code-essentials",
            "limit": min(limit, 50),
            "skip": skip,
            "filters": filters,
        },
    }
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(LEETCODE_GRAPHQL_URL, json=payload, headers=HEADERS)
        resp.raise_for_status()
        data = resp.json()
    return data.get("data", {}).get("problemsetQuestionList", {"total": 0, "questions": []})
