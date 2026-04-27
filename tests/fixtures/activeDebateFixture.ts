import type { Debate } from '../../src/data/debate';
import {
    ACTIVE_DEBATE_RECORD_VERSION,
    ACTIVE_DEBATE_STORAGE_KEY,
    type StoredActiveDebateRecord,
} from '../../src/lib/activeDebateStorage';

export const activeDebateFixture: Debate = {
    topic: 'Should artificial intelligence be regulated by international law?',
    arguments: [
        {
            id: 1,
            side: 'tark',
            text: 'International regulation would prevent a dangerous race to the bottom where countries compete by loosening AI safety standards. A unified framework ensures minimum safety requirements regardless of where AI is developed.',
        },
        {
            id: 2,
            side: 'vitark',
            text: 'International regulation moves at the pace of diplomacy, far too slow for rapid AI advancement. By the time agreements are ratified, they would already be obsolete and potentially stifle beneficial innovation.',
        },
        {
            id: 3,
            side: 'tark',
            text: 'AI systems increasingly operate across borders, making decisions that affect people in multiple jurisdictions. Only international law can provide consistent protections for individuals affected by foreign AI systems.',
        },
        {
            id: 4,
            side: 'vitark',
            text: 'Nations have fundamentally different values, legal traditions, and economic priorities. A one-size-fits-all framework would reflect dominant powers while failing to account for legitimate cultural differences.',
        },
        {
            id: 5,
            side: 'tark',
            text: 'Without coordinated regulation, developing nations risk becoming testing grounds for AI systems that would not meet safety standards in wealthier countries. International oversight ensures equitable protection.',
        },
        {
            id: 6,
            side: 'vitark',
            text: 'Effective AI regulation requires deep technical expertise and rapid iteration. International bodies lack the technical capacity and agility to create meaningful standards, risking toothless or overly restrictive rules.',
        },
        {
            id: 7,
            side: 'vitark',
            text: 'Strong domestic regulation by leading AI nations would be more effective than international frameworks. The EU has demonstrated that regional regulation can set global standards through market influence.',
        },
        {
            id: 8,
            side: 'tark',
            text: 'The existential risks posed by advanced AI are global in nature. Just as nuclear nonproliferation required international cooperation, AI governance demands a coordinated international legal framework.',
        },
    ],
};

export function createStoredActiveDebateFixtureRecord(
    activeDebate: Debate = activeDebateFixture,
): StoredActiveDebateRecord {
    return {
        version: ACTIVE_DEBATE_RECORD_VERSION,
        activeDebate: {
            topic: activeDebate.topic,
            arguments: activeDebate.arguments.map((argument) => ({ ...argument })),
        },
    };
}

export function seedActiveDebateFixture(storage: Pick<Storage, 'setItem'>): void {
    storage.setItem(
        ACTIVE_DEBATE_STORAGE_KEY,
        JSON.stringify(createStoredActiveDebateFixtureRecord()),
    );
}
