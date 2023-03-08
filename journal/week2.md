# Week 2 — Distributed Tracing
- This is the when you get a lot of requests happening in same time in a lot of different services a bunch of seperated log lines don't cut it instead it needs a trace of what happens and software can tell us that trace. When you see track of requests that come in. AN drow in atrace is called a span and it is part of a trace it has a strart time and a duration so it descibes a span of time and represents a single unit of work that was done as part of serving a request.traces tells you not only what happens but when it happended and you can see what happended at same time and what waited for something else to finish.
- Instrumentation is the code that sends the data that makes this trace.
- Traces not only tell you a list of what happens, it also tells when it happens and can see what happens at the same time.
- Set my honeycomb account and created a new environment and set my api key proceeded to my gitpod and created a file with the name of my api alongside gp env to persistent to gitpod when it starts the env next time.
- On my terminal i did gp env HONEYCOMB_SERVICE_NAME="Cruddur" and gp env HONEYCOMB_API_KEY="" but didnt work then i did export HONEYCOMB_SERVICE_NAME="Cruddur" 
- export HONEYCOMB_API_KEY="" and added a OTEL_SERVICE_NAME "Backend-flask" to the docker-compose.yml. 
- alonside {
  OTEL_EXPORTER_OTLP_ENDPOINT: "https://api.honeycomb.io"
  OTEL_EXPORTER_OTLP_HEADERS: "x-honeycomb-team=${HONEYCOMB_API_KEY
  }" 
  we're configuring OTEL to send to honeycomb. OTEL means - Open Telemetry. These are part of the CNCF - cloud native compute foundation and this only runs kubernetes.
  - I ran this pip install opentelemetry-api to instal OTEL and added this 
  - {
  - opentelemetry-api \
    opentelemetry-sdk \
    opentelemetry-exporter-otlp-proto-http \
    opentelemetry-instrumentation-flask \
    opentelemetry-instrumentation-requests
    } to my requirement.txt in my backend file
    i added updates to my app.y and initialized tracing and an exporter
    I explored the pricing concept in honeycomb
    I understood the concepts of observability. it is the way you will break down an entire application into processes, have an exact trace of where a function is calling, where it's basically tranversing the data, where it's going for logging what kind of metric you should look out for when improving that logging capability. and it three pillars are metric, logs and traces.
