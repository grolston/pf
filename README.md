# Pathfinder

Pathfinder is an open-source solution designed to provide automated discoveries of AWS an environment and its multi-account architecture. The tool, written in typescript and utilizing the AWS-SDK v3, is intended to be executed within the AWS management account in the AWS CloudShell.

>**Note:** Pathfinder can operate with `READONLY` permissions to the AWS account, and does not make any changes to the environment.

## TL;DR

With a role that has at minimum the permissions of the AWS managed policy `READONLY` and access to the AWS CloudShell, open the AWS CloudShell in your `Home AWS Region` and run the following command:

```sh
curl -sSL https://raw.githubusercontent.com/grolston/pf/main/pathfinder.sh | sh
```



## Features

* **Automated Discovery:** Pathfinder automates the discovery process, minimizing the need for manual checks and providing a quick overview of the environment.
* **READONLY Access:** The tool operates with READONLY access to the AWS account, ensuring that it does not make any modifications or interfere with the existing setup.
* **AWS CloudShell Compatibility:** Pathfinder is designed to be executed within AWS CloudShell, providing a convenient and secure environment for running discovery.
* **Developed in JavaScript and AWS-SDK v3:** Pathfinder is implemented using JavaScript and relies on the latest AWS-SDK v3 for seamless interaction with AWS services.

## How to Use

1. Login to your AWS Management account with a ReadOnly account.
    * We recommend you use readonly permission on the IAM user or role you are running the command with. Pathfinder is a readonly audit tool and could be run through or admin roles.
2. Access AWS CloudShell: Navigate to AWS CloudShell in the AWS Management Console.
3. Copy and paste the following command to download and execute Pathfinder:
    ```sh
    curl -sSL https://raw.githubusercontent.com/grolston/pf/main/pathfinder.sh | sh
    ```

## Security Considerations

* The tool is designed to operate with READONLY access, minimizing the risk of unintended changes.

## Contribution

Pathfinder is an open-source project, and contributions are welcome. Feel free to submit issues, feature requests, or pull requests to improve the tool.
