import type { Grade } from '../../domain/scheduler';

/**
 * Cor fixa por nota (FR-012 de specs/004-recall-grading/spec.md),
 * usada tanto no botão quanto no feedback pós-toque.
 */
export const GRADE_COLORS: Record<Grade, string> = {
  0: '#f2c94c', // Again — amarelo
  1: '#eb5757', // Hard — vermelho
  2: '#f2994a', // Good — laranja
  3: '#27ae60', // Easy — verde
};

export const GRADE_LABELS: Record<Grade, string> = {
  0: 'Again',
  1: 'Hard',
  2: 'Good',
  3: 'Easy',
};

export const GRADES: Grade[] = [0, 1, 2, 3];
