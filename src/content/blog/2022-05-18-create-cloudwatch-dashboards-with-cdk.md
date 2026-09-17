---
title: "Create CloudWatch Dashboards with CDK"
date: 2022-05-18
category: tech
tags: 
  - "aws"
  - "cdk"
  - "cloudwatch"
  - "typescript"
coverImage: /img/blog/plane-dashboard-clouds.jpg
---

If you are familiar with AWS and CloudWatch, you may have created a dashboard through the AWS console. This can be done fairly easily, with some nice results, but you may have also found that you have to continue to maintain those dashboards as your code changes. If you would like tie a specific dashboard to a version of code, you'll have to export the dashboard as json or similar. Not a great solution. What if it was possible to automatically generate dashboards through code that lived with the rest of your deployable code? Turns out, it's possible with CDK!

First off, what is CDK? The AWS Cloud Development Kit (CDK) is a framework that allows you to create your cloud infrastructure through code. It also allows you to create dashboards through code!

_Note: For the rest of this post I'm going to assume you are using CDK and have it all set up. Also, I'll be using TypeScript in all of my examples._

Let's get into it! To create a new dashboard in CDK, just open up your CDK stack file (The class that extends `cdk.Stack`) and instantiate one!

```typescript
export class ExampleCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const dashboard = new cloudwatch.Dashboard(this, 'example-dashboard');
  }
}
```

Okay, now we have a dashboard. If we deploy the CDK now, an empty dashboard will be created for us.

Next, let's add some widgets! Widgets are driven by metrics, so we will create some of those as well. We'll start with a simple `SingleValueWidget` and `GraphWidget` showing requests.

```typescript
    const requests = new Metric({
      label: 'Requests',
      namespace: 'AWS/ApiGateway',
      metricName: 'Count',
      dimensionsMap: { ApiName: 'example-api' },
      statistic: Statistic.SUM,
    });
    const errors5XX = new Metric({
      label: '5XX Errors',
      namespace: 'AWS/ApiGateway',
      metricName: '5XXError',
      dimensionsMap: { ApiName: 'example-api' },
      statistic: Statistic.SUM,
    });
    const errors4XX = new Metric({
      label: '4XX Errors',
      namespace: 'AWS/ApiGateway',
      metricName: '4XXError',
      dimensionsMap: { ApiName: 'example-api' },
      statistic: Statistic.SUM,
    });
    dashboard.addWidgets(
      new SingleValueWidget({
        title: 'API Requests and Errors',
        metrics: [requests, errors5XX, errors4XX],
        height: 6,
        width: 11,
        setPeriodToTimeRange: true,
      }),
      new GraphWidget({
        title: 'API Requests and Errors',
        left: [requests, errors5XX, errors4XX],
        view: GraphWidgetView.PIE,
        height: 6,
        width: 11,
        legendPosition: LegendPosition.RIGHT,
        setPeriodToTimeRange: true,
      })
    );
```

Okay, so there's a little to unpack here. Each metric has a bit of information including the namespace, metric name, dimension, etc. The easiest way top figure out what to put in here is to create a dashboard in the AWS console and start adding some widgets. It will walk you though all these settings. If you need to review, you can edit a widget to see the metrics.

_Note that the Explorer widget was not available in code as of the writing of this post, but you can use line charts which are a `GraphWidget` with the view set to `GraphWidgetView.TIME_SERIES`._

Once we have some metrics, we call `dashboard.addWidgets()`. Each widget we pass in here will be in the same row. We just call `dashboard.addWidgets()` again to add a new row. In each widget, we make sure to give it a title, list the metrics and set to the `height` and `width`. We don't need to set the `x` and `y` because this widget will get automatically positioned. The `setPeriodToTimeRange` setting makes it so that the numbers match the selected time range at the top instead of using the default period.

One thing you may have noticed in the above code is that the pie chart includes too many requests. Basically, the errors are getting counted twice (once as part of requests and again as the error). To fix this, we can use a `MathExpression`.

```typescript
    const successfulRequests = new MathExpression({
      label: 'Successful Requests',
      expression: 'requests - (errors5XX + errors4XX)',
      usingMetrics: { requests, errors4XX, errors5XX },
    });
```

In this code, we are removing the errors from the total requests and saving it as a new kind of metric. All we need to do now is replace requests with `successfulRequests` in our `GraphWidget`.

From here, we continue to build widgets in the AWS Console and then translate them to code. Each time we deploy our stack, the dashboard will be updated.

As of this writing, these are the widgets that are available in code: [AlarmStatusWidget](https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-cloudwatch.AlarmStatusWidget.html), [AlarmWidget](https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-cloudwatch.AlarmWidget.html), [CustomWidget](https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-cloudwatch.CustomWidget.html), [GraphWidget](https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-cloudwatch.GraphWidget.html), [LogQueryWidget](https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-cloudwatch.LogQueryWidget.html), [SingleValueWidget](https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-cloudwatch.SingleValueWidget.html), [TextWidget](https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-cloudwatch.TextWidget.html).

I hope you enjoy making beautiful dashboards through code!
