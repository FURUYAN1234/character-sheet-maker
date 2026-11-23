import * as z from 'zod/v4';
export { describeArtStyleOptions } from '../src/lib/art-style.js';
export const app = "character-sheet-maker";
export const prefix = "character";
export const port = 45933;
export const operation = "generate_sheet";
export const description = "Generate a character sheet using the normal connected image pipeline. Optional profile fields include faceType, faceOutline, jawShape, eyeShape, eyeSpacing, eyeColor, browShape, noseShape, philtrumLength, mouthShape, faceDetails, shoulderWidth, torsoLegRatio and standingPosture. Pass the user's explicit artStyle as a preset or free-form description, or pass おまかせ to choose a different coordinated art style. Omit artStyle to inherit the current style. Query character_style_options for choices before asking about style. job_get returns an absolute PNG path and its SHA-256.";
export const input = z.object({ profile: z.record(z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]{0,60}$/), z.string().trim().max(500)).refine(p => Object.keys(p).length <= 60).optional() }).strict();
export const output = z.object({ name: z.string().max(500), model: z.string().min(1).max(200), png: z.string().max(25_000_000) }).strict();
