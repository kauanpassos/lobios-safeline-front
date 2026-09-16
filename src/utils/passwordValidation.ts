export const passwordRequirements = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export const isStrongPassword = (password: string) => passwordRequirements.test(password);

export const isNewPasswordAllowed = (currentPassword: string, newPassword: string) => {
  if (!currentPassword || !newPassword) return true;
  return currentPassword !== newPassword;
};
