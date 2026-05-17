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
