using Microsoft.Extensions.Logging;

namespace HookSniff
{
    public class HookSniffClient
    {
        public Authentication Authentication
        {
            get => new Authentication(this);
        }

        public Endpoint Endpoint
        {
            get => new Endpoint(this);
        }

        public EventType EventType
        {
            get => new EventType(this);
        }

        public Health Health
        {
            get => new Health(this);
        }

        public Message Message
        {
            get => new Message(this);
        }

        public MessageAttempt MessageAttempt
        {
            get => new MessageAttempt(this);
        }

        public Statistics Statistics
        {
            get => new Statistics(this);
        }

        public Environment Environment
        {
            get => new Environment(this);
        }

        public BackgroundTask BackgroundTask
        {
            get => new BackgroundTask(this);
        }

        public OperationalWebhook OperationalWebhook
        {
            get => new OperationalWebhook(this);
        }

        public MessagePoller MessagePoller
        {
            get => new MessagePoller(this);
        }

        public Inbound Inbound
        {
            get => new Inbound(this);
        }

        public ConnectorApi Connector
        {
            get => new ConnectorApi(this);
        }

        public ILogger? Logger { get; }

        public HookSniffHttpClient HookSniffHttpClient;

        public HookSniffClient(
            string token,
            HookSniffOptions? options = null,
            ILogger<HookSniffClient>? logger = null,
            HookSniffHttpClient? hooksniffHttpClient = null
        )
        {
            Logger = logger;
            var opts = options ?? new HookSniffOptions(Utils.DefaultServerUrlFromToken(token));
            HookSniffHttpClient =
                hooksniffHttpClient
                ?? new HookSniffHttpClient(
                    token,
                    opts.RetryScheduleMilliseconds,
                    $"hooksniff-libs/{Version.version}/csharp",
                    opts.ServerUrl ?? Utils.DEFAULT_SERVER_URL
                );
        }
    }
}
