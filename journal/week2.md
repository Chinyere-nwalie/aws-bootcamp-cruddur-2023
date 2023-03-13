# Week 2 — Distributed Tracing

- Traces is when you get lots of requests happening in same time in a lot of different services a bunch of seperated log lines don't cut it instead it needs a trace of what happens and software can tell us that trace. When you see track of requests that come in, a trace is called a span and it has a start time and a duration so it descibes a span of time and represents a single unit of work that was done as part of serving a request. Traces tells you not only what happens, but when it happended and you can see what happended at same time and what waited for something else to finish.

Instrumentation is the code, it sends the data that makes this trace.


- I set my honeycomb account and created a new environment and set my api key, proceeded to my Gitpod and created a file with the name of my api alongside gp env to persistent to Gitpod when it starts the env next time.

On my terminal i did:

``gp env HONEYCOMB_SERVICE_NAME="Cruddur" and gp env HONEYCOMB_API_KEY=""
``  
- but it did'nt work. Then i did this:

``
export HONEYCOMB_SERVICE_NAME="Cruddur" 
export HONEYCOMB_API_KEY="" OTEL_SERVICE_NAME
``
  
  
- I configured OTEL to send to honeycomb. OTEL means - Open Telemetry. These are part of the CNCF - cloud native compute foundation and this only runs kubernetes.

I ran this pip install opentelemetry-api to instal OTEL and added this to my requirements.txt in my backend file

``
opentelemetry-api \

opentelemetry-sdk \
opentelemetry-exporter-otlp-proto-http \
opentelemetry-instrumentation-flask \
opentelemetry-instrumentation-requests
``

# Technical task

- Instrumented my backend flask application to use Open Telemetry (OTEL) with Honeycomb.io as the provider, ran queries to explore traces within Honeycomb.io
Instrument AWS X-Ray into backend flask application.

I followed closely the  instructions via this [link](https://www.youtube.com/watch?v=2GD9xCzRId4&list=PLBfufR7vyJJ7k25byhRXJldB5AiwgNnWv&index=30)

![HONEY_COMB](assets/week2.%20Honey%20comb%20OTEL.png)

- I also configured X-Ray daemon within docker-compose and send data back to X-Ray API and observed X-Ray traces within the AWS Console, added segments and sub-segments. with this [link](https://www.youtube.com/watch?v=4SGTW0Db5y0&list=PLBfufR7vyJJ7k25byhRXJldB5AiwgNnWv&index=37)

I added updates to my app.y and initialized tracing and an exporter

I explored the pricing concept in honeycomb

I understood the concepts of observability. [link](https://www.youtube.com/watch?v=bOf4ITxAcXc&list=PLBfufR7vyJJ7k25byhRXJldB5AiwgNnWv&index=31). it is the way you will break down an entire application into processes, have an exact trace of where a function is calling, where it's basically tranversing the data, where it's going for logging what kind of metric you should look out for, when improving that logging capability. and it three pillars are metric, logs and traces.

I understood the concepts of, peripherals and the difference between monitoring and observability. In summary, it's the way the questions are asked that makes a difference. and essentially understood middleware as something that sits in between an application.

# Rollbar

- Integrated Rollbar for Error Logging.

I Triggered an error an observe an error with Rollbar. 

I followed the instructions via this [link](https://www.youtube.com/watch?v=xMBDAb5SEU4&list=PLBfufR7vyJJ7k25byhRXJldB5AiwgNnWv&index=35)

![ROLLBAR](assets/week.2%20Rollbar.png)

I Installed WatchTower and write a custom logger to send application log data to CloudWatch Log group.

Lastly, when you run into an error, go to rollbar, view and rectify it and it save you time for Debugging.
