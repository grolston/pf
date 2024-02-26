import { defineAccountType }  from './src/actions/define-account-type.js';
import  checkIamUsers from './src/actions/check-iam-users.js';
import getEnabledOrgPolicyTypes from './src/actions/get-enabled-org-policy-types.js';
import getEnabledOrgServices from './src/actions/get-enabled-org-services.js'
import getOrgCloudFormation from './src/actions/check-org-cloudformation.js';
import getIdcInfo from './src/actions/get-idc-info.js';
import getOrgDetails from './src/actions/get-org-details.js'
import getOrgTopLevelOus from './src/actions/get-org-ous.js';
import getAllRegions from './src/actions/get-regions.js';
import checkEc2Exists from './src/actions/check-ec2-existence.js';
import checkVpcExists from './src/actions/check-vpc-existence.js';
import checkCloudTrailExists from './src/actions/check-cloudtrail-existence.js';
import getOrgDaAccounts from './src/actions/get-org-da-accounts.js';
import checkConfigExists from './src/actions/check-config-existence.js';
import getOrgMemberAccounts from './src/actions/get-org-member-accounts.js';
import getControlTower from './src/actions/check-control-tower.js';
import checkLegacyCur from './src/actions/check-legacy-cur.js';
import * as fs from 'fs';

const main = async (): Promise<void> => {
	const reportFile = "./Pathfinder.txt"
	let dateTime = new Date()
	fs.writeFileSync(reportFile, "Cloud Foundations - Pathfinder")
	fs.appendFileSync(reportFile, `\nGenerated on: ${dateTime.toUTCString()} \n\n`);
	fs.appendFileSync(reportFile, `\n---------------------------------------------------------`);
	// grab region from aws CloudShell. Set default though region specific calls are for global services
	// and us-east-1 works to get details.
	const region =  process.env.AWS_REGION || 'us-east-1';
	// function checking if management account, member account, or standalone account
	const allRegions = await getAllRegions();
	const accountType = await defineAccountType(region);
	fs.appendFileSync(reportFile, `\n\nAWS ACCOUNT TYPE\n`);

	if (accountType) {
		console.dir(accountType, {depth: null, colors: true})
		fs.appendFileSync(reportFile, `\n  Is in AWS Organization: ${accountType.isInOrganization}`);
		fs.appendFileSync(reportFile, `\n  Assessing AWS Management Account: ${accountType.isManagementAccount}`);

	}
	// all calls require an AWS Organization exist and the account be a management account
	if (accountType.isInOrganization && accountType.isManagementAccount) {
		fs.appendFileSync(reportFile, `\n\n---------------------------------------------------------`);
		fs.appendFileSync(reportFile, `\n\nLegacy CUR\n`);
		const legacyCurCheck = await checkLegacyCur('us-east-1');
		console.dir(legacyCurCheck, {depth: null, colors: true});
		fs.appendFileSync(reportFile, `\n  Is legacy CUR setup: ${legacyCurCheck.isLegacyCurSetup}`);

		fs.appendFileSync(reportFile, `\n\n---------------------------------------------------------`);
		fs.appendFileSync(reportFile, `\n\nAWS ORGANIZATION POLICY TYPES\n`);
    const enableOrgPoliciesCheck = await getEnabledOrgPolicyTypes('us-east-1');
		console.dir(enableOrgPoliciesCheck, {depth: null, colors: true});
		fs.appendFileSync(reportFile, `\n  Service Control Policies (SCP) enabled: ${enableOrgPoliciesCheck.scpEnabled}`);
		fs.appendFileSync(reportFile, `\n  Tag Policies enabled: ${enableOrgPoliciesCheck.tagPolicyEnabled}`);
		fs.appendFileSync(reportFile, `\n  Backup Policies enabled: ${enableOrgPoliciesCheck.backupPolicyEnabled}`);

		fs.appendFileSync(reportFile, `\n\n---------------------------------------------------------`);
		fs.appendFileSync(reportFile, `\n\nAWS ORGANIZATION ENABLED SERVICES\n`);
    const orgEnabledServices = await getEnabledOrgServices('us-east-1');
		console.dir(orgEnabledServices, {depth: null, colors: true});
		fs.appendFileSync(reportFile, `\n  The following AWS Services are enabled within your AWS Organization:`);
		for (const orgService of orgEnabledServices){
			fs.appendFileSync(reportFile, `\n    ${orgService.service}`);
		}

		fs.appendFileSync(reportFile, `\n\n---------------------------------------------------------`);
		fs.appendFileSync(reportFile, `\n\nAWS ORGANIZATION INTEGRATED SERVICE REGISTERED DELEGATED ADMINS\n`);
		const orgDelAdminDetails = await getOrgDaAccounts();
		console.dir(orgDelAdminDetails, {depth: null, colors: true});
		if(orgDelAdminDetails && orgDelAdminDetails.length > 0){
			for (const account of orgDelAdminDetails){
				fs.appendFileSync(reportFile, `\n  Account: ${account.accountName}`);

				if(account.services && account.services.length > 0 ){
					fs.appendFileSync(reportFile, `\n  Delegated Services:`);
					for (const srv of account.services){
						fs.appendFileSync(reportFile, `\n    ${srv.ServicePrincipal}`);
					}
				}
				fs.appendFileSync(reportFile, `\n `);
			}
		} else {
			fs.appendFileSync(reportFile, `\n  No delegated admin accounts in AWS Organization`);
		}

		fs.appendFileSync(reportFile, `\n\n---------------------------------------------------------`);
		fs.appendFileSync(reportFile, `\n\nAWS ORGANIZATION CLOUDFORMATION\n`);
    const cfnOrgStatus = await getOrgCloudFormation(region);
		console.dir(cfnOrgStatus, {depth: null, colors: true});
		fs.appendFileSync(reportFile, `\n  AWS CloudFormation Organization stack sets status : ${cfnOrgStatus.status}`);

		fs.appendFileSync(reportFile, `\n\n---------------------------------------------------------`);
		fs.appendFileSync(reportFile, `\n\nAWS CONTROL TOWER\n`);
		const controlTowerDetails = await getControlTower(region);
		if(controlTowerDetails){
			console.dir(controlTowerDetails, {depth: null, colors: true});
			fs.appendFileSync(reportFile, `\n  Control Tower home region: ${controlTowerDetails.controlTowerRegion}`);
			fs.appendFileSync(reportFile, `\n  Control Tower status: ${controlTowerDetails.status}`);
			fs.appendFileSync(reportFile, `\n  Control Tower Landing Zone version: ${controlTowerDetails.deployedVersion}`);
			fs.appendFileSync(reportFile, `\n  Latest available version: ${controlTowerDetails.deployedVersion}`);
			fs.appendFileSync(reportFile, `\n  Drift Status: ${controlTowerDetails.driftStatus}`);
		}else {
			fs.appendFileSync(reportFile, `\n  AWS Control Tower is not deployed in the AWS Organization`);
		}

		fs.appendFileSync(reportFile, `\n\n---------------------------------------------------------`);
		fs.appendFileSync(reportFile, `\n\nAWS IAM IDENTITY CENTER\n`);
    const idcInformation = await getIdcInfo(allRegions);
		console.dir(idcInformation, {depth: null, colors: true});
		fs.appendFileSync(reportFile, `\n  IdC Region: ${idcInformation.region}`);
		fs.appendFileSync(reportFile, `\n  IdC ARN: ${idcInformation.arn}`);
		fs.appendFileSync(reportFile, `\n  IdC Instance Id: ${idcInformation.id}`);

		fs.appendFileSync(reportFile, `\n\n---------------------------------------------------------`);
		fs.appendFileSync(reportFile, `\n\nAWS ORGANIZATION DETAILS\n`);
    const orgDetails = await getOrgDetails('us-east-1');
		console.dir(orgDetails, {depth: null, colors: true});
		fs.appendFileSync(reportFile, `\n  AWS Organization Id: ${orgDetails.id}`);
		fs.appendFileSync(reportFile, `\n  AWS Organization ARN: ${orgDetails.arn}`);
		fs.appendFileSync(reportFile, `\n  AWS Organization Root OU Id: ${orgDetails.rootOuId}`);

    if(orgDetails.rootOuId){
			fs.appendFileSync(reportFile, `\n\n---------------------------------------------------------`);
			fs.appendFileSync(reportFile, `\n\nAWS ORGANIZATION TOP-LEVEL ORGANIZATION UNITS\n`);
      const orgOus = await getOrgTopLevelOus('us-east-1', orgDetails.rootOuId);
			console.dir(orgOus, {depth: null, colors: true});
			fs.appendFileSync(reportFile, `\n  List of Organization's top-level OUs and AWS accounts:`);
			if(orgOus && orgOus.length > 0){
				for (const ou of orgOus){
					fs.appendFileSync(reportFile, `\n    Organizational Unit: ${ou.name}`);
					fs.appendFileSync(reportFile, `\n      Organizational Unit Id: ${ou.id}`);
					if(ou.accounts && ou.accounts.length > 0){
						fs.appendFileSync(reportFile, `\n      AWS Accounts:`);
						for (const account of ou.accounts){
							fs.appendFileSync(reportFile, `\n        ${account.Name}`);
						}
						fs.appendFileSync(reportFile, `\n`);
					}
					else{
						fs.appendFileSync(reportFile, `\n      AWS Accounts: None`);
					}
					fs.appendFileSync(reportFile, `\n`);
				}

			} else {
				fs.appendFileSync(reportFile, `\n  No top level OUs found.`);
			}
		}

		fs.appendFileSync(reportFile, `\n\n---------------------------------------------------------`);
		fs.appendFileSync(reportFile, `\n\nAWS ORGANIZATION MEMBER ACCOUNTS\n`);
		const orgMemberAccountDetails = await getOrgMemberAccounts();
		console.dir(orgMemberAccountDetails, {depth: null, colors: true});
		if(orgMemberAccountDetails && orgMemberAccountDetails.length > 0){
			for (const memberAccount of orgMemberAccountDetails){
				fs.appendFileSync(reportFile, `\n  Account: ${memberAccount.accountName}`);
				fs.appendFileSync(reportFile, `\n  Account Email: ${memberAccount.accountEmail}\n`);
			}
		} else {
			fs.appendFileSync(reportFile, `No member accounts found which is amazing as this is running from one.`);
		}

	} else if (accountType.isInOrganization && !accountType.isManagementAccount) {
		const message:string = '\nWARNING: You are running Pathfinder from an account that is a member of your AWS Organization. Please run the solution from your AWS Management account.'
		console.warn(message);
		fs.appendFileSync(reportFile, message);
	} else {
		const message:string = '\nWARNING: You are running Pathfinder from an account that not part of an AWS Organization. This account will be treated as a standalone account.'
		console.warn(message);
		fs.appendFileSync(reportFile, message);
	}

	fs.appendFileSync(reportFile, `\n\n\n---------------------------------------------------------`);
	fs.appendFileSync(reportFile, `\n---------------------------------------------------------`);
	fs.appendFileSync(reportFile, `\nAWS MANAGEMENT ACCOUNT CHECKS`);
	fs.appendFileSync(reportFile, `\n---------------------------------------------------------`);
	fs.appendFileSync(reportFile, `\n---------------------------------------------------------\n`);


	// General account checks for all account types (management account, member account, standalone)
	// 1. list all IAM users and if they have keys in the aws account
	const iamUserResult = await checkIamUsers();
	fs.appendFileSync(reportFile, `\n\nIAM USERS CHECK\n`);
	if (iamUserResult && iamUserResult.length > 0) {
		console.dir(iamUserResult, {depth: null, colors: true});
		for(const iamUser of iamUserResult){
			fs.appendFileSync(reportFile, `\n  IAM User: ${iamUser.userName}`);
			if(iamUser.accessKeyId){
				fs.appendFileSync(reportFile, `\n    User API Key ID: ${iamUser.accessKeyId}`);
			}
			fs.appendFileSync(reportFile, `\n`);
		}
	} else {
		fs.appendFileSync(reportFile, `\n  No IAM Users found.`);
	}
	fs.appendFileSync(reportFile, `\n\n---------------------------------------------------------`);
	// 2. find out if EC2 workloads are running in the account
	const ec2Check = await checkEc2Exists(allRegions);
	fs.appendFileSync(reportFile, `\n\nEC2 INSTANCE CHECK\n`);
	if(ec2Check && ec2Check.find(param => param.ec2Found === true)){
		console.dir(ec2Check, {depth: null, colors: true});
		for ( const ec2 of ec2Check ){
			if(ec2.ec2Found){
				fs.appendFileSync(reportFile, `\n  ${ec2.region} - found EC2 Instance(s).`);
			}
		}
	}else {
		fs.appendFileSync(reportFile, `\n  No EC2 instances found.`);
	}
	fs.appendFileSync(reportFile, `\n\n---------------------------------------------------------`);
	// 3. list all VPCs (default or not)
	const vpcCheck = await checkVpcExists(allRegions);
	fs.appendFileSync(reportFile, `\n\nVPC CHECK\n`);
	if(vpcCheck && vpcCheck.length >0){
		console.dir(vpcCheck, {depth: null, colors: true});
		for(const vpcFind of vpcCheck){
			if(vpcFind.vpcFound){
				fs.appendFileSync(reportFile, `\n  ${vpcFind.region} - found VPC(s).`);
			}
		}
	}else {
		fs.appendFileSync(reportFile, `\n  No VPCs found.`);
	}

	fs.appendFileSync(reportFile, `\n\n---------------------------------------------------------`);
	// 4. check for cloudtrail running
	const cloudTrailCheck = await checkCloudTrailExists(allRegions);
	fs.appendFileSync(reportFile, `\n\nCLOUDTRAIL CHECK\n`);
	if(cloudTrailCheck && cloudTrailCheck.length > 0) {
		console.dir(cloudTrailCheck, {depth: null, colors: true});
		for(const ctFind of cloudTrailCheck){
			if(ctFind.trailFound){
				fs.appendFileSync(reportFile, `\n  CloudTrail found in ${ctFind.region}`);
				fs.appendFileSync(reportFile, `\n    Is Organization Trail: ${ctFind.isOrgTrail}`);
				fs.appendFileSync(reportFile, `\n    Is MultiRegion: ${ctFind.isMultiRegion}`);
				fs.appendFileSync(reportFile, `\n`);
			}
		}
	}else {
		fs.appendFileSync(reportFile, `\n  No AWS CloudTrail resource discovered`);
	}
	fs.appendFileSync(reportFile, `\n`);
	fs.appendFileSync(reportFile, `\n\n---------------------------------------------------------`);
	// 5. check for AWS config recorders and delivery channels
	const configCheck = await checkConfigExists(allRegions);
	fs.appendFileSync(reportFile, `\n\nAWS CONFIG CHECK\n`);
	if(configCheck && configCheck.find(param => param.configRecorderFound === true)){
		console.dir(configCheck, {depth: null, colors: true});
		for (const configFind of configCheck){
			if(configFind.configRecorderFound){
				fs.appendFileSync(reportFile, `\n  ${configFind.region} - Config Recorder found`);
			}
			if(configFind.configDeliveryChannelFound){
				fs.appendFileSync(reportFile, `\n  ${configFind.region} - Config Delivery Channel found`);
			}
		}
	} else{
		fs.appendFileSync(reportFile, `\n  No AWS Config resource discovered`);
	}
	fs.appendFileSync(reportFile, `\n\n\n  END ASSESSMENT`);
};

main();
