# Week 2 — Distributed Tracing
-[Observability](#observability)
  -[Distrubuted Tracing](#distrubuted-tracing)
  -[Instrumentation in Observability](#instrumentation-in-observability)
  -[Observability in AWS](#observability-in-aws)
-[Technical task](#technical-task)
  -[OTEL with Honeycomb](#otel-with-honeycomb)
  -[AWS X-Ray](#aws-x-ray)
  -[Rollbar](#rollbar)

## Observability

Observability is the ability to understand and analyze the internal state of a system or application based on the external outputs and behaviors it exhibits. It involves collecting, analyzing, and visualizing data such as logs, metrics, and traces to gain insights into the performance, health, and behavior of the system.

The three pillars of observability are,
- **Metrics:** Metrics are numerical measurements of the state of a system. They can be used to track things like CPU usage, memory usage, and database queries.
- **Logs:** Logs are records of events that occur in a system. They can be used to track things like errors, exceptions, and unusual activity.
- **Traces:** Traces are records of the path of a request through a distributed system. They can be used to track things like performance bottlenecks and errors.

Observability can help make better monitoring and It can be used for the following main reasons

- **Identifying performance:** By tracking metrics, you can identify the parts of your system that are using the most resources. This can help you to identify performance bottlenecks and optimize your system for performance.
- **Troubleshooting errors:** By tracking logs, you can identify the source of errors in your system. This can help you to troubleshoot errors and resolve them quickly.
- **Improving reliability:** By tracking traces, you can identify the path of requests through your system. This can help you to improve the reliability of your system by identifying potential problems before they cause outages.

### Instrumentation in Observability

Instrumentation is the process of adding code to a system to collect data, this data can then be used to observe, monitor and troubleshoot the system.

 > Key pointer *Instrumentation is the code, it sends the data that makes this trace*

The different types of data that can be collected through instrumentation and used to instrument your system:

1. **OpenTelemetry:** is an open-source instrumentation framework that facilitates the collection of metrics, logs, and traces from a variety of systems. 

2. **Application Performance Monitoring tools:** APM tools are ready-to-use commercial tools and come pre-packaged with features tailored to streamline the key pillars process.


### Distrubuted Tracing

Distributed tracing is a method of monitoring and troubleshooting distributed systems by tracking and correlating individual requests as they traverse multiple services and components. It helps developers identify performance bottlenecks, understand dependencies, and diagnose issues in complex distributed architectures.

Also: - Traces is when you get lots of requests happening in same time in a lot of different services, seperated log lines don't cut it instead it needs a trace of what happens and software can tell us that trace. When you see track of requests that come in, a trace is called a span and it has a start time and a duration so it descibes a span of time and represents a single unit of work that was done as part of serving a request. Traces tells you not only what happens, but when it happend and you can see what happend at same time and what waited for something else to finish. 

Core components of Distributed tracing are below.

- **Trace:** a collection of spans that represent the path of a single request through a distributed system.
- **Span:**  a unit of work within a trace. It represents a specific event or operation that occurred during the processing of a request.
- **Context propagation:** the process of passing a trace identifier from one service to another as a request is processed. This allows the different services to associate their spans with the same trace.
- **Instrumentation libraries:**  used to instrument applications so that they can generate spans. These libraries typically provide APIs that allow developers to tag spans with metadata, such as the name of the service, the operation, and the start and end time.
- **Tracing data collectors:** Tracing data collectors are used to collect spans from the different services in a distributed system. These collectors typically store spans in a database or other persistent storage.
- **Tracing data visualizers:** Tracing data visualizers are used to visualize traces. These tools allow developers to see the path of a request through a distributed system and to analyze the performance and reliability of the system.

### Observability in AWS

AWS provides services and tools to help you achieve observability for your applications and services.

Some of the key AWS services and tools for observability include:

1. **Amazon CloudWatch:** CloudWatch is a monitoring service that provides you with a central place to collect and store metrics, logs, and traces from your AWS resources.
2. **Amazon X-Ray:** X-Ray is a distributed tracing service that helps you to understand the path of a request through your distributed system.
3. **AWS OpenTelemetry:** OpenTelemetry is an open-source instrumentation framework that can be used to collect metrics, logs, and traces from a variety of systems.
4. **Rollbar** Rollbar is an error monitoring and tracking platform that helps developers identify, diagnose, and fix software errors and issues in real-time. It provides real-time alerts, error grouping, and detailed error reports to help teams quickly resolve issues and improve software quality

|  Tools         | Description                                          |
|-------------| -----------------------------------------------------|
| [Honeycomb](#open-telemetry-with-honeycomb)   |   A Distributed Tracing and Observability platform to debug complex systems. |
| [AWS X-Ray](#onboard-aws-x-ray)   |   Tracing service to analyze and debug distributed applications.  |
| [Cloudwatch](#monitor-flaskapp-with-cloudwatch) | Monitoring and observability service in the AWS Console.   |
| [Rollbar](#error-free-code-with-rollbar)  | Cloud-based log monitoring tool to identify software errors in real-time.  |

---

## Technical task

- Instrumented my backend flask application to use Open Telemetry (OTEL) with Honeycomb.io as the provider, ran queries to explore traces within Honeycomb.io
- Instrumented AWS X-Ray into backend flask application.

### OTEL with Honeycomb

- On [Honeycomb website](https://www.honeycomb.io/), I created a new environment named `bootcamp`, and get the corresponding API key, proceeded to my Gitpod and created a file with the name of my api alongside gp env to persistent to Gitpod when it starts the env next time.

- I configured OTEL to send to honeycomb. OTEL means - Open Telemetry. These are part of the CNCF - cloud native compute foundation and this only runs kubernetes.

On my terminal I ran:

```sh
gp env HONEYCOMB_SERVICE_NAME="Cruddur" and gp env HONEYCOMB_API_KEY=""
```

- but it didn't work. Then i did this:

```sh
  export HONEYCOMB_SERVICE_NAME="Cruddur" 
  export HONEYCOMB_API_KEY="" OTEL_SERVICE_NAME
```
  

- Add open telemetry related dependencies in `backend-flask/requirements.txt`, and pip install them
- Instrument honeycomb in `backend-flask/app.py`
- Add environment variables in `docker-compose.yml` 

After `docker compose up` launch the app and browse the backend endpoint of `/api/activities/home`, traces can be viewed on the Honeycomb website as shown in the screenshot below.

![HONEY_COMB](assets/week2.%20Honey%20comb%20OTEL.png)

We can run queries to explore traces within Honeycomb as shown in the screenshot below

![HONEY_COMB](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(149).png)

I followed closely the  instructions via this [link](https://www.youtube.com/watch?v=2GD9xCzRId4&list=PLBfufR7vyJJ7k25byhRXJldB5AiwgNnWv&index=30)


I explored the pricing concept in honeycomb

I understood the concepts of observability. [link](https://www.youtube.com/watch?v=bOf4ITxAcXc&list=PLBfufR7vyJJ7k25byhRXJldB5AiwgNnWv&index=31). it is the way you will break down an entire application into processes, have an exact trace of where a function is calling, where it's basically tranversing the data, where it's going for logging what kind of metric you should look out for, when improving that logging capability. and it three pillars are metric, logs and traces.

I understood the concepts of, peripherals and the difference between monitoring and observability. In summary, it's the way the questions are asked that makes a difference. and essentially understood middleware as something that sits in between an application.

---

### AWS X-Ray

- Add `aws-xray-sdk` to `/backend-flask/requirements.txt`, and pip install it
- Instrument AWS X-Ray in `/backend-flask/app.py`
- Add `xray-daemon` and configure environment variables in `docker-compose.yml`

Then we can add segments and subsegments in `backend-flask/services/user_activities.py` These data can be sent data back to the X-Ray API.

After docker compose up, we can browse the home and a user page where we've add xray recorder to capture. Then we can observe X-Ray traces within the AWS Console as shown in the screenshot below.

- I also configured X-Ray daemon within docker-compose and send data back to X-Ray API and observed X-Ray traces within the AWS Console, added segments and sub-segments. with this [link](https://www.youtube.com/watch?v=4SGTW0Db5y0&list=PLBfufR7vyJJ7k25byhRXJldB5AiwgNnWv&index=37)

I added updates to my app.py and initialized tracing and an exporter

---

### Rollbar

- Integrated Rollbar for Error Logging.

I Triggered an error an observe an error with Rollbar. 

I followed the instructions via this [link](https://www.youtube.com/watch?v=xMBDAb5SEU4&list=PLBfufR7vyJJ7k25byhRXJldB5AiwgNnWv&index=35)

![ROLLBAR](assets/week.2%20Rollbar.png)

I Installed WatchTower and write a custom logger to send application log data to CloudWatch Log group.

Lastly, when you run into an error, go to rollbar, view and rectify it and it save you time for Debugging.


> Week 3 [Decentralized Authentication](week3.md)
