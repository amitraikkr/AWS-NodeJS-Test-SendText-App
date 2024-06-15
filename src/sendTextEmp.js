import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);
const snsClient = new SNSClient({});

async function sendText(textParams) {
    try {
        await snsClient.send(new PublishCommand(textParams));
        console.log("Message sent");
    } catch (error) {
        console.log("Error, message not sent ", error);
    }
}

export const handler = async (event) => {

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear() - 1;
    const date = yyyy + "-" + mm + "-" + dd;

    console.log('Date is: ', date);

    const params = {
        FilterExpression: "startDate = :topic",
        ExpressionAttributeValues: {
            ":topic": date
        },
        ProjectionExpression: "firstName, phone",
        TableName: process.env.TABLE_NAME, // Use environment variable
    };

    try {
        const data = await ddbDocClient.send(new ScanCommand(params));
        console.log('Data is: ', data);
        data.Items.forEach(async (element) => {
            const textParams = {
                PhoneNumber: element.phone, // Ensure correct access
                Message:
                    "Hi " +
                    element.firstName +
                    "; Congratulations on your work anniversary!",
                TopicArn: process.env.SNS_TOPIC_ARN // Use environment variable
            }
            await sendText(textParams);
        });
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Application has error', error: error.message })
        }
    }
}