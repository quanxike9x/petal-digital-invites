import type { EffectModule } from './opening/curtain';
import { curtainEffect } from './opening/curtain';
import { doubleDoorEffect, envelopeEffect } from './opening/doubleDoor';
import { heartsParticleEffect, petalsParticleEffect, snowParticleEffect } from './particles/hearts';

const EFFECT_REGISTRY: Map<string, EffectModule> = new Map();

// REGISTER INITIAL PLUGIN EFFECTS
export function registerEffect(effect: EffectModule) {
  EFFECT_REGISTRY.set(effect.id, effect);
}

// APPLY EFFECT TO CONTAINER ELEMENT
export function applyEffect(name: string, container: HTMLElement, options?: Record<string, unknown>) {
  if (!container || !name || name === 'none') return;
  const effect = EFFECT_REGISTRY.get(name);
  if (effect) {
    effect.apply(container, options);
  }
}

// REMOVE EFFECT FROM CONTAINER ELEMENT
export function removeEffect(name: string, container: HTMLElement) {
  if (!container || !name) return;
  const effect = EFFECT_REGISTRY.get(name);
  if (effect) {
    effect.remove(container);
  }
}

// REGISTER ALL SYSTEM BUILT-IN EFFECTS
registerEffect(curtainEffect);
registerEffect(doubleDoorEffect);
registerEffect(envelopeEffect);
registerEffect(heartsParticleEffect);
registerEffect(petalsParticleEffect);
registerEffect(snowParticleEffect);

export function getAllRegisteredEffects(): EffectModule[] {
  return Array.from(EFFECT_REGISTRY.values());
}
