import logging
from typing import Dict

from models.resume_profile import ResumeProfile
from models.jd_profile import JDProfile
from models.ats_result import (
    AtsResult,
)

from orchestrator.builder.interview_context_builder import (
    InterviewContextBuilder,
)

from services.llm_service import llm_service
from utils.json_parser import extract_json

logger = logging.getLogger(__name__)


class InterviewAgent:
    """
    Generates a complete interview preparation plan using the candidate
    profile, ATS analysis and target job description.
    """

    def generate(
        self,
        resume_data: Dict,
        jd_data: Dict,
        ats_data: Dict,
    ) -> Dict:

        resume = ResumeProfile.model_validate(resume_data)
        jd = JDProfile.model_validate(jd_data)
        ats = AtsResult.model_validate(ats_data)

        interview_context = InterviewContextBuilder().build(
            resume=resume,
            jd=jd,
            ats=ats,
        )

        prompt = f"""
You are a Senior Staff Engineer, Hiring Manager and Interview Coach.

Your responsibility is to prepare this candidate to crack the interview in TWO WEEKS.

Note - Just return the JSON, do not add any extra text or explanation.

==========================
INTERVIEW CONTEXT
==========================

{interview_context.model_dump_json(indent=2)}

==========================
YOUR OBJECTIVES
==========================

Analyze the interview context and produce a highly personalized preparation guide.

The plan must be practical, actionable and specific to this candidate.

Focus on:

1. Candidate strengths.
2. Candidate weaknesses.
3. Required skills.
4. Missing skills.
5. Transferable skills.
6. Projects.
7. ATS score.
8. Company expectations.
9. Target role.

==========================
GENERATE
==========================

1. Two week interview preparation plan.

Week 1:
- Day 1
- Day 2
...
- Day 7

Week 2:
- Day 8
...
- Day 14

Each day should contain

- Topics
- Goal
- Practice
- Expected outcome

----------------------------------

2. Technical Interview Questions

Generate 20 questions.

Each question must contain

- question
- skill
- difficulty (Easy/Medium/Hard)
- why_this_is_asked

----------------------------------

3. Project Based Questions

Generate 15 questions from candidate projects.

Focus on

- Architecture
- Scalability
- Tradeoffs
- Performance
- Concurrency
- Kafka
- Redis
- Microservices
- Design Decisions

----------------------------------

4. Behavioral Questions

Generate 10 behavioral questions.

----------------------------------

5. Weak Areas

Rank from highest priority.

Each item contains

- topic
- reason
- preparation_strategy

----------------------------------

6. Strong Areas

Each contains

- topic
- leverage_strategy

----------------------------------

7. Company Preparation

Based on the target company and role provide

- business overview
- engineering culture
- products
- interview style
- what they evaluate
- backend expectations
- system design expectations
- coding expectations

----------------------------------

8. Revision Checklist

Checklist for the final day before interview.

----------------------------------

9. Interview Tips

Provide

- before interview
- during interview
- after interview

----------------------------------

10. Confidence Assessment

Return

- probability_of_success (0-100)

- biggest_risk

- strongest_advantage

- final_recommendation

----------------------------------

11. ATS Score Assessment (Recruiter Perspective)

Estimate an ATS compatibility score independently.

IMPORTANT:
- Do NOT use the mathematical ATS score provided elsewhere.
- Treat this as a completely independent evaluation.
- Think like a Senior Technical Recruiter reviewing the resume for the first time.
- Estimate the likelihood that this resume would pass ATS screening and be shortlisted for the target role.

Consider:

- relevance of experience
- target role alignment
- required skills coverage
- preferred skills coverage
- project relevance
- technology stack alignment
- measurable achievements
- seniority match
- transferable skills
- critical missing skills
- overall hire readiness

Return:

- overall_ats_score (0-100)
- confidence (0-100)
- strengths
- weaknesses
- reasoning

==========================

12. ATS Score Assessment (Dimension Breakdown)

Ignore any ATS score already present in the context.

Evaluate the resume across the following dimensions.

Experience Match
Weight: 25%

Required Skills Match
Weight: 25%

Preferred Skills Match
Weight: 10%

Project Relevance
Weight: 15%

Technology Depth
Weight: 10%

Achievement Impact
Weight: 5%

Seniority Alignment
Weight: 5%

Transferable Skills
Weight: 5%

For every dimension return:

- score (0-100)
- reasoning

Finally return:

- overall_ats_score (0-100)

IMPORTANT:
Do NOT calculate the overall score using a mathematical average of the dimension scores.

Instead, use the dimension scores as guidance and estimate the final score like an experienced recruiter who considers the complete profile, including interactions between strengths and weaknesses.

Return JSON only.

Schema:

{{
  "ats_assessment_recruiter": {{
    "overall_ats_score": 0,
    "confidence": 0,
    "strengths": [],
    "weaknesses": [],
    "reasoning": ""
  }},

  "ats_assessment_breakdown": {{
    "dimensions": {{
      "experience_match": {{
        "score": 0,
        "reasoning": ""
      }},
      "required_skills_match": {{
        "score": 0,
        "reasoning": ""
      }},
      "preferred_skills_match": {{
        "score": 0,
        "reasoning": ""
      }},
      "project_relevance": {{
        "score": 0,
        "reasoning": ""
      }},
      "technology_depth": {{
        "score": 0,
        "reasoning": ""
      }},
      "achievement_impact": {{
        "score": 0,
        "reasoning": ""
      }},
      "seniority_alignment": {{
        "score": 0,
        "reasoning": ""
      }},
      "transferable_skills": {{
        "score": 0,
        "reasoning": ""
      }}
    }},
    "overall_ats_score": 0
  }},

  "two_week_plan": [
    {{
      "day": 1,
      "goal": "",
      "topics": [],
      "practice": [],
      "expected_outcome": ""
    }}
  ],

  "technical_questions": [
    {{
      "question": "",
      "skill": "",
      "difficulty": "",
      "why_this_is_asked": ""
    }}
  ],

  "project_questions": [
    {{
      "question": "",
      "project": "",
      "focus_area": "",
      "difficulty": ""
    }}
  ],

  "behavioral_questions": [
    {{
      "question": "",
      "competency": ""
    }}
  ],

  "weak_areas": [
    {{
      "topic": "",
      "reason": "",
      "preparation_strategy": ""
    }}
  ],

  "strong_areas": [
    {{
      "topic": "",
      "leverage_strategy": ""
    }}
  ],

  "company_preparation": {{
    "business_overview": "",
    "engineering_culture": "",
    "products": [],
    "interview_style": "",
    "backend_expectations": [],
    "system_design_expectations": [],
    "coding_expectations": []
  }},

  "revision_checklist": [
    ""
  ],

  "interview_tips": {{
    "before": [],
    "during": [],
    "after": []
  }},

  "confidence_assessment": {{
    "probability_of_success": 0,
    "biggest_risk": "",
    "strongest_advantage": "",
    "final_recommendation": ""
  }}
}}
"""

        try:

            response = llm_service.generate(prompt)
            if not response:
                raise ValueError("Empty response received from LLM.")

            return extract_json(response)

        except Exception as ex:

            logger.exception(
                "Interview generation failed: %s",
                ex,
            )

            raise


interview_agent = InterviewAgent()
