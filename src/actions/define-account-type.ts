import { AccountType } from '../types';

import { OrganizationsClient, DescribeOrganizationCommand, } from "@aws-sdk/client-organizations";

// function checking if management account, member account, or standalone account
export const defineAccountType = async (region: string): Promise<AccountType> => {
  const organizationsClient = new OrganizationsClient({ region });
  try {
    const describeOrganizationCommand = new DescribeOrganizationCommand({});
    const describeOrganizationResponse = await organizationsClient.send(describeOrganizationCommand);
    const isInOrganization = !!describeOrganizationResponse.Organization;
    // the account is not standalone and part of AWS Organization
    if (describeOrganizationResponse.Organization?.MasterAccountId) {
      const isManagementAccount = describeOrganizationResponse.Organization?.MasterAccountId === describeOrganizationResponse.Organization?.MasterAccountId;
      return { isInOrganization, isManagementAccount };
    } else {
      return { isInOrganization };
    }
  } catch (error) {
    console.error("Error:", error);
    return { isInOrganization: false };
  } finally {
    organizationsClient.destroy();
  }
};