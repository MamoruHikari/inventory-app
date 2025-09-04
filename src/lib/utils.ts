import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateCustomId(
  prefix: string,
  counter: number,
  format: string = "{prefix}-{counter}"
): string {
  const paddedCounter = counter.toString().padStart(3, '0')
  return format
    .replace('{prefix}', prefix)
    .replace('{counter}', paddedCounter)
}

export function getNextCounter(existingItems: any[], format: string, prefix: string): number {
  if (existingItems.length === 0) return 1
  
  const numbers = existingItems
    .map(item => {
      const match = item.customId.match(/(\d+)/)
      return match ? parseInt(match[1]) : 0
    })
    .filter(num => num > 0)
  
  return numbers.length > 0 ? Math.max(...numbers) + 1 : 1
}

export function getActiveCustomFields(inventory: any) {
  const fields = []
  
  for (let i = 1; i <= 3; i++) {
    if (inventory[`stringField${i}Active`]) {
      fields.push({
        key: `stringValue${i}`,
        name: inventory[`stringField${i}Name`] || `String Field ${i}`,
        type: 'string',
        order: inventory[`stringField${i}Order`] || i
      })
    }
  }
  
  for (let i = 1; i <= 3; i++) {
    if (inventory[`numberField${i}Active`]) {
      fields.push({
        key: `numberValue${i}`,
        name: inventory[`numberField${i}Name`] || `Number Field ${i}`,
        type: 'number',
        order: inventory[`numberField${i}Order`] || (3 + i)
      })
    }
  }
  
  for (let i = 1; i <= 3; i++) {
    if (inventory[`boolField${i}Active`]) {
      fields.push({
        key: `boolValue${i}`,
        name: inventory[`boolField${i}Name`] || `Boolean Field ${i}`,
        type: 'boolean',
        order: inventory[`boolField${i}Order`] || (6 + i)
      })
    }
  }
  
  return fields.sort((a, b) => a.order - b.order)
}