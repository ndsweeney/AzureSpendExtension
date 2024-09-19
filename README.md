# AzureSpendExtension
Edge Extension for retrieving Azure spend so you don't have to go to the portal 

The Azure Spend Tracker is a Microsoft Edge browser extension designed to help users monitor and manage their Azure cloud spending directly from the browser. It provides real-time insights into your Azure costs, enabling you to stay informed about your spending patterns and identify opportunities for cost optimisation without needing to log into the Azure Portal.

## Key Features

Previous Month's Total Cost

- **Historical Comparison:** Displays the total cost from the previous month to help you compare and analyse spending trends over time.

Cost Breakdown by Service

- **Service-Level Insights:** Breaks down your spending by Azure services, allowing you to see which services contribute most to your costs.
- **Interactive Breakdown:** Presents the cost distribution in an organised list for easy interpretation.

Azure Advisor Recommendations

- **Cost-Saving Suggestions:** Retrieves and displays personalised recommendations from Azure Advisor to help reduce costs.
- **Actionable Insights:** Includes potential savings amounts and solutions to optimise resource usage.

User-Friendly Interface

- **Quick Access:** Accessible via an icon in the browser toolbar, providing immediate spending information at a glance.
- **Clean Design:** The popup interface is designed for clarity and ease of use, with organized sections and readable fonts.

The below forecasting will not work with certain accounts as specified https://learn.microsoft.com/en-us/rest/api/consumption/?view=rest-consumption-2024-08-01#list-of-unsupported-subscription-types

Current Azure Spend Display

- **Actual Spend to Date:** Shows your actual Azure spending up to the current date within the billing cycle.
- **Average Daily Spend:** Calculates and displays the average daily spend based on the spending so far in the current month.

Forecasted Monthly Spend

- **Total Expected Monthly Spend:** Estimates your total Azure spending for the current month by combining actual spend to date with forecasted spend.
- **Forecasted Spend:** Provides an estimation of future spending based on current usage patterns.

## Future Development

- Tidy up the code
- Choose your subscription
- Further Cost Information

https://github.com/ndsweeney/AzureSpendExtension/blob/main/Images/OutputExample.png
