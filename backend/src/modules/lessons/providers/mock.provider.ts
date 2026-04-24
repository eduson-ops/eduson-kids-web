import { Injectable } from '@nestjs/common';
import {
  AiProvider,
  LessonGenerationInput,
  LessonGenerationOutput,
} from './ai-provider.interface';

/**
 * Deterministic stub provider. Returns the same shape as a real provider
 * would, with placeholder text. Lets us test the entire pipeline (queue,
 * persistence, methodist review flow) without burning Claude/GPT tokens.
 *
 * Cost: 0 kopecks. Latency: simulated 1.5s.
 *
 * In production we never want this enabled by default — guarded by
 * `AI_PROVIDER=mock` env or `tenant.featureFlags.useMockAiProvider`.
 */
@Injectable()
export class MockAiProvider implements AiProvider {
  readonly name = 'mock';

  async generateLesson(input: LessonGenerationInput): Promise<LessonGenerationOutput> {
    // Simulate generation latency to exercise queue + status flow
    await new Promise((r) => setTimeout(r, 1500));

    const title = `Mock-урок: ${input.topicCode} (класс ${input.grade}, ${input.focus})`;

    return {
      title,
      payload: {
        plan: {
          steps: [
            { title: 'Введение', durationMin: 5, description: 'Знакомство с темой и целями урока.' },
            { title: 'Объяснение', durationMin: 12, description: `Базовая концепция темы ${input.topicCode}.` },
            { title: 'Практика', durationMin: 15, description: `Решение задач в формате ${input.focus}.` },
            { title: 'Закрепление', durationMin: 5, description: 'Квиз + рефлексия.' },
            { title: 'Домашнее задание', durationMin: 3, description: 'Краткое объяснение ДЗ.' },
          ],
        },
        teacherGuide:
          `# Методичка к уроку\n\n` +
          `Тема: ${input.topicCode}, класс ${input.grade}, фокус ${input.focus}.\n\n` +
          `## Цели урока\n- Личностные\n- Метапредметные\n- Предметные\n\n` +
          `## Ход урока\n1. Введение (5 мин)\n2. Объяснение (12 мин)\n3. Практика (15 мин)\n4. Закрепление (5 мин)\n5. ДЗ (3 мин)\n\n` +
          `## Критерии оценивания\n- 5: полностью самостоятельно\n- 4: с подсказками учителя\n- 3: только с прямой помощью\n`,
        quiz: [
          {
            question: `Что такое ${input.topicCode}? (мок-вопрос)`,
            options: ['Вариант A', 'Вариант B', 'Вариант C', 'Вариант D'],
            correctIndex: 1,
          },
          {
            question: 'Какой тип данных подходит для счётчика?',
            options: ['string', 'int', 'bool', 'list'],
            correctIndex: 1,
          },
          {
            question: 'Что делает оператор +=?',
            options: ['Сравнение', 'Присваивание с прибавлением', 'Деление', 'Печать'],
            correctIndex: 1,
          },
        ],
        homework: {
          description: 'Создайте программу, которая считает сумму чисел от 1 до 100.',
          autograder: {
            kind: 'python_unittest',
            tests: ['assert solution() == 5050'],
          },
        },
        videoScript: {
          scenes: [
            { caption: 'Привет! Я пингвин Кубик.', voice: 'penguin_kubik', characterId: 'kubik', durationS: 4 },
            { caption: 'Сегодня мы изучим тему ' + input.topicCode + '.', voice: 'penguin_kubik', characterId: 'kubik', durationS: 5 },
            { caption: 'Давай посмотрим как это работает.', voice: 'penguin_kubik', characterId: 'kubik', durationS: 4 },
          ],
        },
        assets: [
          { kind: 'sprite', source: 'procedural', spec: { name: 'kubik_idle', size: 128 } },
          { kind: 'image', source: 'procedural', spec: { name: 'background', kind: 'classroom' } },
        ],
        meta: {
          provider: 'mock',
          model: 'mock-v1',
          tokensUsed: 0,
          costKopecks: 0,
        },
      },
      costKopecks: 0,
      generationSeconds: 1.5,
    };
  }
}
