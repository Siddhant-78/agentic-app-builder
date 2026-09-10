import arcjet, {tokenBucket, detectPromptInjection, sensitiveInfo} from "@arcjet/next";

export const aj = arcjet({
    key: process.env.ARCJET_API_KEY,
    characteristics: ["userId"],
    rules:[
        tokenBucket({
            mode:"LIVE", // In live mode, the rule is enforced
            refillRate: 5,// 5 tokens per minute
            interval: 60, // 60 seconds
            capacity: 5, // 5 tokens maximum
        }),
        detectPromptInjection({
            mode: "LIVE", // In live mode, the rule is enforced
            action: "BLOCK", // Block the request if prompt injection is detected
        }),
        sensitiveInfo({
            mode: "LIVE", // In live mode, the rule is enforced
            action: "BLOCK", // Block the request if sensitive information is detected
            deny: ["CREDIT_CARD_NUMBER", "API_KEY", "AWS_SECRET_ACCESS_KEY"],
        }),
    ],
});