import { OrganizationsClient, ListAccountsCommand, DescribeOrganizationalUnitCommand, ListAccountsCommandOutput } from '@aws-sdk/client-organizations';
import { OrgMemberAccount } from '../types';

async function getOrgMemberAccounts(): Promise<OrgMemberAccount[]> {
  let orgMemberAccountInfo: OrgMemberAccount[] = []
  const orgsClient = new OrganizationsClient({ region: 'us-east-1' });
  try {
    const response: ListAccountsCommandOutput = await orgsClient.send(new ListAccountsCommand({}));
    if(response.Accounts && response.Accounts.length > 0){
    for (const account of response.Accounts){
      let orgMemberAccount: OrgMemberAccount = {
        accountName: account.Name,
        accountEmail: account.Email,
      }
      orgMemberAccountInfo.push(orgMemberAccount)
    }
    }
  } catch (error) {
    console.error('Error listing AWS accounts:', error);
  }
  finally {
    orgsClient.destroy()
  }
  return orgMemberAccountInfo
}

export default getOrgMemberAccounts;