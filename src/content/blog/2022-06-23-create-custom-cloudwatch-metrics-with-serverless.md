---
title: "Create Custom CloudWatch Metrics with Serverless"
date: 2022-06-23
categories: 
  - "aws-development"
tags: 
  - "aws"
  - "cdk"
  - "cloudwatch"
  - "metrics"
  - "serverless"
  - "typescript"
coverImage: "pexels-photo-7947709.jpeg"
---

In a previous post, I wrote about how to [Create CloudWatch Dashboards with CDK](https://curtisaube.com/blog/create-cloudwatch-dashboards-with-cdk/). In this followup post, I describe how to create a custom CloudWatch Metric with Serverless and then display it in the dashboard.

You can view built-in metrics in the AWS Console under **CloudWatch->Metrics** and we've already used some when creating our dashboard, but sometimes you need a custom metric from the logs. First, you'll need to identify the logs that you want to base your metric off of. In our case, the log contains some json that we'll use to create our custom metric.

```json
[METRIC]: timeToAssignment 	 
{
    "requestId": "c9f0bfbd-cf4b-4aee-9b83-5698c07a53d0",
    "itemId": "642c6829-6adb-40fb-91ee-6a0f781c5a5d",
    "userId": "021487bf-133b-4d8c-9709-63210230fd42",
    "timeToAssignment": 7347467,
    "timestamp": "2022-06-23T16:02:08.060Z"
}
```

We are looking to use that timeToAssignment value so that we can build an average for our dashboard. Now that we know what we want, within the same log group we can select the **Metric filters** tab and click **Create metric filter** (Don't worry, we will automate this in a minute).

The filter pattern to use can be a bit tricky. You are essentially trying to find and retrieve the value in a single statement. My filter ended up looking like this: `{ $.timeToAssignment = * }`. The curly braces indicate that we are looking in the json part. The `$.` says that we are selecting a property followed by the name of that property. The right side of the equation can be a double-quoted string for matching on a specific value or `*` for matching on any value.

On the next page, the **Metric namespace** and **Metric name** can be whatever you like, but the **Metric Value**, in our case should be `$.timeToAssignment` to indicate that the value of this property should be used. In some cases, you may enter a specific value (like `1`, if you are counting occurrences for instance).

Now that we've created the metric we can start using it in our dashboard. Like in our [last post](https://curtisaube.com/blog/create-cloudwatch-dashboards-with-cdk/), we'll be creating it in code using CDK.

```typescript
    const averageAssignTime = new Metric({
      label: 'Average Assign Time (s)',
      namespace: `some-namespace`,
      metricName: 'timeToAssignment',
      statistic: Statistic.AVERAGE
    });
    this.addWidgets(
      new SingleValueWidget({
        title: 'Average Times',
        metrics: [averageAssignTime],
        height: 3,
        width: 22,
      })
    );
```

Now that that's working, let's automate the creation of this custom metric. To do this in Serverless, we can use a handy plugin called [serverless-plugin-metric](https://www.serverless.com/plugins/serverless-plugin-metric). Just install using your package manager of choice, then we can configure it from our main serverless.yml file.

```yaml
functions:
  hello:
    handler: handler.hello
custom:
  metrics:
    - name: timeToAssignment
      pattern: '{ $.timeToAssignment = * }'
      functions: 
        - hello
      value: '$.timeToAssignment'
plugins:
  - ./plugins/serverless-plugin-metric.js
```

Once you've automated the creation of the custom metric, you may need to update the dashboard to use the new correct `namespace` and `metricName`.

If you use separate files to hold the lambda functions, as of the writing of this post, you need a [patched version of the plugin](https://github.com/alex20465/serverless-plugin-metric/pull/10).

And that's it! Now you have an automated metric that can be used if your automated dashboard!
