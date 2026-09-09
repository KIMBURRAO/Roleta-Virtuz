export function canReservePrize(online: boolean, stockControlEnabled: boolean): boolean {
  return online || !stockControlEnabled
}
