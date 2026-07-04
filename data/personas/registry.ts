import type { Persona, PersonaId } from "@/types";
import { hitesh } from "./hiteshSir";
import { piyush } from "./piyushSir";

const registry: Record<PersonaId, Persona> = {
  hitesh,
  piyush,
};

export function getPersona(id: PersonaId): Persona {
  const persona = registry[id];
  if (!persona) throw new Error(`Unknown persona: ${id}`);
  return persona;
}

export function getAllPersonas(): Persona[] {
  return Object.values(registry);
}