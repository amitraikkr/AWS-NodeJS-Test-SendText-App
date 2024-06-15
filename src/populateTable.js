import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { BatchWriteCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

export const handler = (async (event) => {
    let data;
    console.log(event);
    try{
            
            data =  JSON.parse(event.body);
            console.log(data);

    }catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({message: "Invalid JSON input"})
        };
    }

    if (!Array.isArray(data)){
        data = [data];
    }

    const params = {
        RequestItems: {
            Employees: data.map(item => ({
                PutRequest: {
                    Item: item,
                },
            })),
        },
    };

    try{
            const result = await ddbDocClient.send(new BatchWriteCommand(params));
            return {
                statusCode: 200,
                body: JSON.stringify({message: "Success", data: result})
            }
    }catch (error) {
        console.error("Error", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error while populating", error: error.message}),
        };
    }
})