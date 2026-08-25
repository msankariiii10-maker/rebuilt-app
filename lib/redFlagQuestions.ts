// Standard PT red-flag screening questions.
// A "yes" on ANY of these means the person should NOT self-treat —
// they need an in-person evaluation before starting the program.
// TODO: review this list against current clinical guidelines before launch —
// this is a starting point, not a substitute for your own clinical judgment.

export type RedFlagQuestion = {
  id: string;
  question: string;
};

export const redFlagQuestions: RedFlagQuestion[] = [
  {
    id: 'unexplained_weight_loss',
    question: 'Have you had unexplained weight loss recently?',
  },
  {
    id: 'night_pain',
    question: 'Do you have pain at night that is not relieved by rest or changing position?',
  },
  {
    id: 'bladder_bowel_changes',
    question: 'Have you had any new loss of bladder or bowel control, or numbness in the groin/inner thigh area?',
  },
  {
    id: 'recent_trauma',
    question: 'Did your pain start after a significant trauma (fall, accident, direct impact)?',
  },
  {
    id: 'progressive_weakness',
    question: 'Do you have weakness or numbness that is getting worse over time?',
  },
  {
    id: 'fever_illness',
    question: 'Do you have a fever, chills, or feel generally unwell along with your pain?',
  },
  {
    id: 'history_cancer',
    question: 'Do you have a history of cancer?',
  },
];
