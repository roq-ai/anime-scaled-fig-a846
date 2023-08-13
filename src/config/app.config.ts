interface AppConfigInterface {
  ownerRoles: string[];
  customerRoles: string[];
  tenantRoles: string[];
  tenantName: string;
  applicationName: string;
  addOns: string[];
}
export const appConfig: AppConfigInterface = {
  ownerRoles: ['Store Owner'],
  customerRoles: [],
  tenantRoles: ['Store Owner', 'Store Administrator', 'Inventory Manager'],
  tenantName: 'Store',
  applicationName: 'Anime Scaled Figure Store',
  addOns: ['file upload', 'chat', 'notifications', 'file'],
};
