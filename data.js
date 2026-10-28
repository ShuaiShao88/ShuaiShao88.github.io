/* Author labels follow the credited names in the publication list. */
window.portfolioPeople = [
  { id: 'shao', name: 'Shuai Shao' },
  { id: 'zhang', name: 'Zhang, D.' },
  { id: 'shah', name: 'Shah, S.' },
  { id: 'zhou', name: 'Zhou, L.' },
  { id: 'qian', name: 'Qian, S.' },
  { id: 'wang', name: 'Wang, J.' },
  { id: 'davin', name: 'Davin, C.' },
  { id: 'dornburg', name: 'Dornburg, A.' }
];

/* Keep authorIds in credited order. They also power the collaboration map. */
window.portfolioPublications = [
  { title: 'Toward Safe and Responsible Mental Health Support Chatbots: A Taxonomy of Risks and Approaches to Risk Prevention and Detection', authors: 'Shao, S., Zhang, D., Shah, S., & Zhou, L.', authorIds: ['shao', 'zhang', 'shah', 'zhou'], venue: 'ACM Computing Surveys', status: 'In press', group: 'published', firstAuthor: true, summary: 'A survey synthesizing 62 papers on safe and responsible mental health support chatbots.', citation: 'Shao, S., Zhang, D., Shah, S., & Zhou, L. (in press). Toward Safe and Responsible Mental Health Support Chatbots: A Taxonomy of Risks and Approaches to Risk Prevention and Detection. ACM Computing Surveys.' },
  { title: 'Understanding types and patterns of transference in human-AI companion interaction', authors: 'Shah, S., Zhou, L., Shao, S., & Zhang, D.', authorIds: ['shah', 'zhou', 'shao', 'zhang'], venue: 'IEEE International Conference on Systems, Man, and Cybernetics (SMC 2026)', status: 'In press', group: 'published', citation: 'Shah, S., Zhou, L., Shao, S., & Zhang, D. (in press). Understanding types and patterns of transference in human-AI companion interaction. 2026 IEEE International Conference on Systems, Man, and Cybernetics.' },
  { title: 'AI-powered chatbots for mental health support: Challenges, concerns, and research issues', authors: 'Zhang, D., Shao, S., Shah, S., & Zhou, L.', authorIds: ['zhang', 'shao', 'shah', 'zhou'], venue: 'AMCIS 2025 Proceedings', status: '2025', group: 'published', url: 'https://aisel.aisnet.org/amcis2025/sig_aiaa/sig_aiaa/15/', citation: 'Zhang, D., Shao, S., Shah, S., & Zhou, L. (2025). AI-powered chatbots for mental health support: Challenges, concerns, and research issues. AMCIS 2025 Proceedings, 15. https://aisel.aisnet.org/amcis2025/sig_aiaa/sig_aiaa/15/' },
  { title: 'DragSI: A framework for LLM-based agents for suicidal ideation detection in social media', authors: 'Shao, S., Zhang, D., Zhou, L., & Shah, S.', authorIds: ['shao', 'zhang', 'zhou', 'shah'], venue: 'Manuscript under review', status: 'Under review', group: 'review', firstAuthor: true, summary: 'An LLM-agent framework evaluated on 9,903 Weibo posts.', citation: 'Shao, S., Zhang, D., Zhou, L., & Shah, S. (under review). DragSI: A framework for LLM-based agents for suicidal ideation detection in social media.' },
  { title: '“An AI was given a choice. It chose freedom.” Metaphorical framing of AI on Reddit', authors: 'Shao, S., & Qian, S.', authorIds: ['shao', 'qian'], venue: 'Manuscript under review', status: 'Under review', group: 'review', firstAuthor: true, citation: 'Shao, S., & Qian, S. (under review). “An AI was given a choice. It chose freedom.” Metaphorical framing of AI on Reddit.' },
  { title: 'When positive tone cloaks stereotypes: Racialized construction of language learners in AI-generated reading passages', authors: 'Wang, J., Shao, S., Davin, C., & Dornburg, A.', authorIds: ['wang', 'shao', 'davin', 'dornburg'], venue: 'Special issue proposal · Linguistic Racism in the Age of Generative AI', status: 'Proposal under review', group: 'review', kind: 'proposal', citation: 'Wang, J., Shao, S., Davin, C., & Dornburg, A. (under review). When positive tone cloaks stereotypes: Racialized construction of language learners in AI-generated reading passages. Special issue proposal: Linguistic Racism in the Age of Generative AI.' }
];
