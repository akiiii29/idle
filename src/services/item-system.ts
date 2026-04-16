export interface Item {
  id: string;
  name: string;
  type: "heal" | "buff";
  value: number;
}

export function useItem(state: any, item: Item, maxHp: number) {
  if (state.potion.qty <= 0) return false;
  
  state.potion.qty--;
  
  if (item.type === "heal") {
    const healAmount = item.value;
    state.hp = Math.min(maxHp, state.hp + healAmount);
    if (state.floorLogs) {
      state.floorLogs.push(`Dùng ${item.name}, hồi ${healAmount} HP (Còn lại: ${state.potion.qty}). HP: ${state.hp}/${maxHp}`);
    }
  } else if (item.type === "buff") {
    // Note: State buffs logic
    state.buffs.push(item);
    if (state.floorLogs) {
      state.floorLogs.push(`Dùng ${item.name}, nhận hiệu ứng cường hóa! (Còn lại: ${state.potion.qty})`);
    }
  }
  
  return true;
}
