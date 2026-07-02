using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Text;
using MiniJSON;
using UnityEngine;

[assembly: RuntimeCompatibility(WrapNonExceptionThrows = true)]
[assembly: AssemblyVersion("0.0.0.0")]
namespace MiniJSON;

public static class Json
{
	private sealed class Parser : IDisposable
	{
		private enum TOKEN
		{
			NONE,
			CURLY_OPEN,
			CURLY_CLOSE,
			SQUARED_OPEN,
			SQUARED_CLOSE,
			COLON,
			COMMA,
			STRING,
			NUMBER,
			TRUE,
			FALSE,
			NULL
		}

		private const string WORD_BREAK = "{}[],:\"";

		private StringReader json;

		private char PeekChar => Convert.ToChar(json.Peek());

		private char NextChar => Convert.ToChar(json.Read());

		private string NextWord
		{
			get
			{
				StringBuilder stringBuilder = new StringBuilder();
				while (!IsWordBreak(PeekChar))
				{
					stringBuilder.Append(NextChar);
					if (json.Peek() == -1)
					{
						break;
					}
				}
				return stringBuilder.ToString();
			}
		}

		private TOKEN NextToken
		{
			get
			{
				EatWhitespace();
				if (json.Peek() == -1)
				{
					return TOKEN.NONE;
				}
				switch (PeekChar)
				{
				case '{':
					return TOKEN.CURLY_OPEN;
				case '}':
					json.Read();
					return TOKEN.CURLY_CLOSE;
				case '[':
					return TOKEN.SQUARED_OPEN;
				case ']':
					json.Read();
					return TOKEN.SQUARED_CLOSE;
				case ',':
					json.Read();
					return TOKEN.COMMA;
				case '"':
					return TOKEN.STRING;
				case ':':
					return TOKEN.COLON;
				case '-':
				case '0':
				case '1':
				case '2':
				case '3':
				case '4':
				case '5':
				case '6':
				case '7':
				case '8':
				case '9':
					return TOKEN.NUMBER;
				default:
					return NextWord switch
					{
						"false" => TOKEN.FALSE, 
						"true" => TOKEN.TRUE, 
						"null" => TOKEN.NULL, 
						_ => TOKEN.NONE, 
					};
				}
			}
		}

		private Parser(string jsonString)
		{
			json = new StringReader(jsonString);
		}

		public static bool IsWordBreak(char c)
		{
			return char.IsWhiteSpace(c) || "{}[],:\"".IndexOf(c) != -1;
		}

		public static object Parse(string jsonString)
		{
			using Parser parser = new Parser(jsonString);
			return parser.ParseValue();
		}

		public void Dispose()
		{
			json.Dispose();
			json = null;
		}

		private Dictionary<string, object> ParseObject()
		{
			Dictionary<string, object> dictionary = new Dictionary<string, object>();
			json.Read();
			while (true)
			{
				switch (NextToken)
				{
				case TOKEN.COMMA:
					continue;
				case TOKEN.NONE:
					return null;
				case TOKEN.CURLY_CLOSE:
					return dictionary;
				}
				string text = ParseString();
				if (text == null)
				{
					return null;
				}
				if (NextToken != TOKEN.COLON)
				{
					return null;
				}
				json.Read();
				dictionary[text] = ParseValue();
			}
		}

		private List<object> ParseArray()
		{
			List<object> list = new List<object>();
			json.Read();
			bool flag = true;
			while (flag)
			{
				TOKEN nextToken = NextToken;
				switch (nextToken)
				{
				case TOKEN.NONE:
					return null;
				case TOKEN.SQUARED_CLOSE:
					flag = false;
					break;
				default:
				{
					object item = ParseByToken(nextToken);
					list.Add(item);
					break;
				}
				case TOKEN.COMMA:
					break;
				}
			}
			return list;
		}

		private object ParseValue()
		{
			TOKEN nextToken = NextToken;
			return ParseByToken(nextToken);
		}

		private object ParseByToken(TOKEN token)
		{
			return token switch
			{
				TOKEN.STRING => ParseString(), 
				TOKEN.NUMBER => ParseNumber(), 
				TOKEN.CURLY_OPEN => ParseObject(), 
				TOKEN.SQUARED_OPEN => ParseArray(), 
				TOKEN.TRUE => true, 
				TOKEN.FALSE => false, 
				TOKEN.NULL => null, 
				_ => null, 
			};
		}

		private string ParseString()
		{
			StringBuilder stringBuilder = new StringBuilder();
			json.Read();
			bool flag = true;
			while (flag)
			{
				if (json.Peek() == -1)
				{
					flag = false;
					break;
				}
				char nextChar = NextChar;
				switch (nextChar)
				{
				case '"':
					flag = false;
					break;
				case '\\':
					if (json.Peek() == -1)
					{
						flag = false;
						break;
					}
					nextChar = NextChar;
					switch (nextChar)
					{
					case '"':
					case '/':
					case '\\':
						stringBuilder.Append(nextChar);
						break;
					case 'b':
						stringBuilder.Append('\b');
						break;
					case 'f':
						stringBuilder.Append('\f');
						break;
					case 'n':
						stringBuilder.Append('\n');
						break;
					case 'r':
						stringBuilder.Append('\r');
						break;
					case 't':
						stringBuilder.Append('\t');
						break;
					case 'u':
					{
						char[] array = new char[4];
						for (int i = 0; i < 4; i++)
						{
							array[i] = NextChar;
						}
						stringBuilder.Append((char)Convert.ToInt32(new string(array), 16));
						break;
					}
					}
					break;
				default:
					stringBuilder.Append(nextChar);
					break;
				}
			}
			return stringBuilder.ToString();
		}

		private object ParseNumber()
		{
			string nextWord = NextWord;
			if (nextWord.IndexOf('.') == -1)
			{
				long.TryParse(nextWord, out var result);
				return result;
			}
			double.TryParse(nextWord, out var result2);
			return result2;
		}

		private void EatWhitespace()
		{
			while (char.IsWhiteSpace(PeekChar))
			{
				json.Read();
				if (json.Peek() == -1)
				{
					break;
				}
			}
		}
	}

	private sealed class Serializer
	{
		private StringBuilder builder;

		private Serializer()
		{
			builder = new StringBuilder();
		}

		public static string Serialize(object obj)
		{
			Serializer serializer = new Serializer();
			serializer.SerializeValue(obj);
			return serializer.builder.ToString();
		}

		private void SerializeValue(object value)
		{
			if (value == null)
			{
				builder.Append("null");
			}
			else if (value is string str)
			{
				SerializeString(str);
			}
			else if (value is bool)
			{
				builder.Append((!(bool)value) ? "false" : "true");
			}
			else if (value is IList anArray)
			{
				SerializeArray(anArray);
			}
			else if (value is IDictionary obj)
			{
				SerializeObject(obj);
			}
			else if (value is char)
			{
				SerializeString(new string((char)value, 1));
			}
			else
			{
				SerializeOther(value);
			}
		}

		private void SerializeObject(IDictionary obj)
		{
			bool flag = true;
			builder.Append('{');
			foreach (object key in obj.Keys)
			{
				if (!flag)
				{
					builder.Append(',');
				}
				SerializeString(key.ToString());
				builder.Append(':');
				SerializeValue(obj[key]);
				flag = false;
			}
			builder.Append('}');
		}

		private void SerializeArray(IList anArray)
		{
			builder.Append('[');
			bool flag = true;
			foreach (object item in anArray)
			{
				if (!flag)
				{
					builder.Append(',');
				}
				SerializeValue(item);
				flag = false;
			}
			builder.Append(']');
		}

		private void SerializeString(string str)
		{
			builder.Append('"');
			char[] array = str.ToCharArray();
			char[] array2 = array;
			foreach (char c in array2)
			{
				switch (c)
				{
				case '"':
					builder.Append("\\\"");
					continue;
				case '\\':
					builder.Append("\\\\");
					continue;
				case '\b':
					builder.Append("\\b");
					continue;
				case '\f':
					builder.Append("\\f");
					continue;
				case '\n':
					builder.Append("\\n");
					continue;
				case '\r':
					builder.Append("\\r");
					continue;
				case '\t':
					builder.Append("\\t");
					continue;
				}
				int num = Convert.ToInt32(c);
				if (num >= 32 && num <= 126)
				{
					builder.Append(c);
					continue;
				}
				builder.Append("\\u");
				builder.Append(num.ToString("x4"));
			}
			builder.Append('"');
		}

		private void SerializeOther(object value)
		{
			if (value is float)
			{
				builder.Append(((float)value).ToString("R"));
			}
			else if (value is int || value is uint || value is long || value is sbyte || value is byte || value is short || value is ushort || value is ulong)
			{
				builder.Append(value);
			}
			else if (value is double || value is decimal)
			{
				builder.Append(Convert.ToDouble(value).ToString("R"));
			}
			else
			{
				SerializeString(value.ToString());
			}
		}
	}

	public static object Deserialize(string json)
	{
		if (json == null)
		{
			return null;
		}
		return Parser.Parse(json);
	}

	public static string Serialize(object obj)
	{
		return Serializer.Serialize(obj);
	}
}
public enum UpsightLogLevel
{
	SUPPRESS,
	VERBOSE,
	DEBUG,
	INFO,
	WARN,
	ERROR,
	ASSERT
}
public enum UpsightAndroidPurchaseResolution
{
	Unset,
	Bought,
	Cancelled,
	Invalid,
	Owned,
	Error
}
public class Upsight
{
	private static AndroidJavaObject _plugin;

	static Upsight()
	{
		if (Application.platform != RuntimePlatform.Android)
		{
			return;
		}
		UpsightManager.noop();
		using AndroidJavaClass androidJavaClass = new AndroidJavaClass("com.upsight.unity.UpsightPlugin");
		_plugin = androidJavaClass.CallStatic<AndroidJavaObject>("instance", new object[0]);
	}

	public static void setLogLevel(UpsightLogLevel logLevel)
	{
		if (Application.platform == RuntimePlatform.Android)
		{
			_plugin.Call("setLogLevel", logLevel.ToString());
		}
	}

	public static string getPluginVersion()
	{
		if (Application.platform != RuntimePlatform.Android)
		{
			return "UnityEditor";
		}
		return _plugin.Call<string>("getPluginVersion", new object[0]);
	}

	public static void init(string appToken, string appSecret, string gcmProjectNumber = null)
	{
		if (Application.platform == RuntimePlatform.Android)
		{
			_plugin.Call("init", appToken, appSecret, gcmProjectNumber);
		}
	}

	public static void requestAppOpen()
	{
		if (Application.platform == RuntimePlatform.Android)
		{
			_plugin.Call("requestAppOpen");
		}
	}

	public static void sendContentRequest(string placementID, bool showsOverlayImmediately, bool shouldAnimate = true, Dictionary<string, object> dimensions = null)
	{
		if (Application.platform == RuntimePlatform.Android)
		{
			AndroidJavaObject androidJavaObject = dictionaryToJavaHashMap(dimensions);
			_plugin.Call("sendContentRequest", placementID, showsOverlayImmediately, shouldAnimate, androidJavaObject);
		}
	}

	public static AndroidJavaObject dictionaryToJavaHashMap(Dictionary<string, object> dictionary)
	{
		AndroidJavaObject result = null;
		if (dictionary != null)
		{
			AndroidJavaClass androidJavaClass = new AndroidJavaClass("net.minidev.json.parser.JSONParser");
			int num = androidJavaClass.GetStatic<int>("MODE_JSON_SIMPLE");
			string text = Json.Serialize(dictionary);
			AndroidJavaObject androidJavaObject = new AndroidJavaObject("net.minidev.json.parser.JSONParser", num);
			result = androidJavaObject.Call<AndroidJavaObject>("parse", new object[1] { text });
		}
		return result;
	}

	public static void preloadContentRequest(string placementID, Dictionary<string, object> dimensions = null)
	{
		if (Application.platform == RuntimePlatform.Android)
		{
			AndroidJavaObject androidJavaObject = dictionaryToJavaHashMap(dimensions);
			_plugin.Call("preloadContentRequest", placementID, androidJavaObject);
		}
	}

	public static void getContentBadgeNumber(string placementID)
	{
		if (Application.platform == RuntimePlatform.Android)
		{
			_plugin.Call("sendMetadataRequest", placementID);
		}
	}

	public static bool getOptOutStatus()
	{
		if (Application.platform != RuntimePlatform.Android)
		{
			return false;
		}
		return _plugin.Call<bool>("getOptOutStatus", new object[0]);
	}

	public static void setOptOutStatus(bool optOutStatus)
	{
		if (Application.platform == RuntimePlatform.Android)
		{
			_plugin.Call("setOptOutStatus", optOutStatus);
		}
	}

	public static void trackInAppPurchase(string sku, int quantity, UpsightAndroidPurchaseResolution resolutionType, double price, string orderId, string store)
	{
		if (Application.platform == RuntimePlatform.Android)
		{
			_plugin.Call("trackInAppPurchase", sku, quantity, (int)resolutionType, price, orderId, store);
		}
	}

	public static void reportCustomEvent(Dictionary<string, object> properties)
	{
		if (Application.platform == RuntimePlatform.Android)
		{
			_plugin.Call("reportCustomEvent", Json.Serialize(properties));
		}
	}

	public static void registerForPushNotifications()
	{
		if (Application.platform == RuntimePlatform.Android)
		{
			_plugin.Call("registerForPushNotifications");
		}
	}

	public static void deregisterForPushNotifications()
	{
		if (Application.platform == RuntimePlatform.Android)
		{
			_plugin.Call("deregisterForPushNotifications");
		}
	}

	public static void setShouldOpenContentRequestsFromPushNotifications(bool shouldOpen)
	{
	}

	public static void setShouldOpenUrlsFromPushNotifications(bool shouldOpen)
	{
	}
}
public class UpsightContentRequest : MonoBehaviour
{
	public string placementID;

	public bool showsOverlayImmediately = true;

	public bool shouldAnimate = true;

	private void Start()
	{
		Upsight.sendContentRequest(placementID, showsOverlayImmediately, shouldAnimate);
	}

	private void OnEnable()
	{
		UpsightManager.contentRequestLoadedEvent += contentRequestLoaded;
		UpsightManager.contentRequestFailedEvent += contentRequestFailed;
		UpsightManager.contentWillDisplayEvent += contentWillDisplay;
		UpsightManager.contentDismissedEvent += contentDismissed;
	}

	private void OnDisable()
	{
		UpsightManager.contentRequestLoadedEvent -= contentRequestLoaded;
		UpsightManager.contentRequestFailedEvent -= contentRequestFailed;
		UpsightManager.contentWillDisplayEvent -= contentWillDisplay;
		UpsightManager.contentDismissedEvent -= contentDismissed;
	}

	private void contentRequestLoaded(string placementID)
	{
	}

	private void contentRequestFailed(string placementID, string error)
	{
	}

	private void contentWillDisplay(string placementID)
	{
	}

	private void contentDismissed(string placementID, string dismissType)
	{
	}
}
public class UpsightManager : MonoBehaviour
{
	public static event Action<Dictionary<string, object>> openRequestSucceededEvent;

	public static event Action<string> openRequestFailedEvent;

	public static event Action<string> contentWillDisplayEvent;

	public static event Action<string> contentDidDisplayEvent;

	public static event Action<string> contentRequestLoadedEvent;

	public static event Action<string, string> contentRequestFailedEvent;

	public static event Action<string> contentPreloadSucceededEvent;

	public static event Action<string, string> contentPreloadFailedEvent;

	public static event Action<int> badgeCountRequestSucceededEvent;

	public static event Action<string> badgeCountRequestFailedEvent;

	public static event Action trackInAppPurchaseSucceededEvent;

	public static event Action<string> trackInAppPurchaseFailedEvent;

	public static event Action reportCustomEventSucceededEvent;

	public static event Action<string> reportCustomEventFailedEvent;

	public static event Action<string, string> contentDismissedEvent;

	public static event Action<UpsightPurchase> makePurchaseEvent;

	public static event Action<Dictionary<string, object>> dataOptInEvent;

	public static event Action<UpsightReward> unlockedRewardEvent;

	public static event Action<string, string> pushNotificationWithContentReceivedEvent;

	public static event Action<string> pushNotificationWithUrlReceivedEvent;

	static UpsightManager()
	{
		try
		{
			GameObject gameObject = new GameObject("UpsightManager");
			gameObject.AddComponent<UpsightManager>();
			UnityEngine.Object.DontDestroyOnLoad(gameObject);
		}
		catch (UnityException)
		{
			Debug.LogWarning("It looks like you have the UpsightManager on a GameObject in your scene. Please remove the script from your scene.");
		}
	}

	public static void noop()
	{
	}

	private void openRequestSucceeded(string json)
	{
		if (UpsightManager.openRequestSucceededEvent != null)
		{
			UpsightManager.openRequestSucceededEvent(Json.Deserialize(json) as Dictionary<string, object>);
		}
	}

	private void openRequestFailed(string error)
	{
		if (UpsightManager.openRequestFailedEvent != null)
		{
			UpsightManager.openRequestFailedEvent(error);
		}
	}

	private void contentWillDisplay(string placementID)
	{
		if (UpsightManager.contentWillDisplayEvent != null)
		{
			UpsightManager.contentWillDisplayEvent(placementID);
		}
	}

	private void contentDidDisplay(string placementID)
	{
		if (UpsightManager.contentDidDisplayEvent != null)
		{
			UpsightManager.contentDidDisplayEvent(placementID);
		}
	}

	private void contentRequestLoaded(string placementID)
	{
		if (UpsightManager.contentRequestLoadedEvent != null)
		{
			UpsightManager.contentRequestLoadedEvent(placementID);
		}
	}

	private void contentRequestFailed(string json)
	{
		if (UpsightManager.contentRequestFailedEvent != null && Json.Deserialize(json) is Dictionary<string, object> dictionary && dictionary.ContainsKey("error") && dictionary.ContainsKey("placement"))
		{
			UpsightManager.contentRequestFailedEvent(dictionary["placement"].ToString(), dictionary["error"].ToString());
		}
	}

	private void contentPreloadSucceeded(string placementID)
	{
		if (UpsightManager.contentPreloadSucceededEvent != null)
		{
			UpsightManager.contentPreloadSucceededEvent(placementID);
		}
	}

	private void contentPreloadFailed(string json)
	{
		if (UpsightManager.contentPreloadFailedEvent != null && Json.Deserialize(json) is Dictionary<string, object> dictionary && dictionary.ContainsKey("error") && dictionary.ContainsKey("placement"))
		{
			UpsightManager.contentPreloadFailedEvent(dictionary["placement"].ToString(), dictionary["error"].ToString());
		}
	}

	private void metadataRequestSucceeded(string json)
	{
		if (UpsightManager.badgeCountRequestSucceededEvent != null && Json.Deserialize(json) is Dictionary<string, object> dictionary && dictionary.ContainsKey("notification"))
		{
			Dictionary<string, object> dictionary2 = dictionary["notification"] as Dictionary<string, object>;
			if (dictionary2.ContainsKey("type") && dictionary2.ContainsKey("value"))
			{
				UpsightManager.badgeCountRequestSucceededEvent(int.Parse(dictionary2["value"].ToString()));
				return;
			}
		}
		UpsightManager.badgeCountRequestFailedEvent("No badge count could be found for the placement");
	}

	private void metadataRequestFailed(string error)
	{
		if (UpsightManager.badgeCountRequestFailedEvent != null)
		{
			UpsightManager.badgeCountRequestFailedEvent(error);
		}
	}

	private void trackInAppPurchaseSucceeded(string empty)
	{
		if (UpsightManager.trackInAppPurchaseSucceededEvent != null)
		{
			UpsightManager.trackInAppPurchaseSucceededEvent();
		}
	}

	private void trackInAppPurchaseFailed(string error)
	{
		if (UpsightManager.trackInAppPurchaseFailedEvent != null)
		{
			UpsightManager.trackInAppPurchaseFailedEvent(error);
		}
	}

	private void reportCustomEventSucceeded(string empty)
	{
		if (UpsightManager.reportCustomEventSucceededEvent != null)
		{
			UpsightManager.reportCustomEventSucceededEvent();
		}
	}

	private void reportCustomEventFailed(string error)
	{
		if (UpsightManager.reportCustomEventFailedEvent != null)
		{
			UpsightManager.reportCustomEventFailedEvent(error);
		}
	}

	private void contentDismissed(string json)
	{
		if (UpsightManager.contentDismissedEvent != null && Json.Deserialize(json) is Dictionary<string, object> dictionary && dictionary.ContainsKey("dismissType") && dictionary.ContainsKey("placement"))
		{
			UpsightManager.contentDismissedEvent(dictionary["placement"].ToString(), dictionary["dismissType"].ToString());
		}
	}

	private void makePurchase(string json)
	{
		if (UpsightManager.makePurchaseEvent != null)
		{
			UpsightManager.makePurchaseEvent(UpsightPurchase.purchaseFromJson(json));
		}
	}

	private void dataOptIn(string json)
	{
		if (UpsightManager.dataOptInEvent != null)
		{
			UpsightManager.dataOptInEvent(Json.Deserialize(json) as Dictionary<string, object>);
		}
	}

	private void unlockedReward(string json)
	{
		if (UpsightManager.unlockedRewardEvent != null)
		{
			UpsightManager.unlockedRewardEvent(UpsightReward.rewardFromJson(json));
		}
	}

	private void pushNotificationWithContentReceived(string json)
	{
		if (UpsightManager.pushNotificationWithContentReceivedEvent != null && Json.Deserialize(json) is Dictionary<string, object> dictionary && dictionary.ContainsKey("messageID") && dictionary.ContainsKey("contentUnitID"))
		{
			UpsightManager.pushNotificationWithContentReceivedEvent(dictionary["messageID"].ToString(), dictionary["contentUnitID"].ToString());
		}
	}

	private void pushNotificationWithUrlReceived(string url)
	{
		if (UpsightManager.pushNotificationWithUrlReceivedEvent != null)
		{
			UpsightManager.pushNotificationWithUrlReceivedEvent(url);
		}
	}
}
public class UpsightMonoBehavior : MonoBehaviour
{
	public string androidAppToken;

	public string androidAppSecret;

	public string gcmProjectNumber;

	public string iosAppToken;

	public string iosAppSecret;

	public bool registerForPushNotifications;

	private void Start()
	{
		Upsight.init(androidAppToken, androidAppSecret, gcmProjectNumber);
		Upsight.requestAppOpen();
		if (registerForPushNotifications)
		{
			Upsight.registerForPushNotifications();
		}
	}
}
public class UpsightPurchase
{
	public string placement { get; private set; }

	public int quantity { get; private set; }

	public string productIdentifier { get; private set; }

	public string store { get; private set; }

	public string receipt { get; private set; }

	public string title { get; private set; }

	public double price { get; private set; }

	public static UpsightPurchase purchaseFromJson(string json)
	{
		UpsightPurchase upsightPurchase = new UpsightPurchase();
		if (Json.Deserialize(json) is Dictionary<string, object> dictionary)
		{
			if (dictionary.ContainsKey("placement") && dictionary["placement"] != null)
			{
				upsightPurchase.placement = dictionary["placement"].ToString();
			}
			if (dictionary.ContainsKey("quantity") && dictionary["quantity"] != null)
			{
				upsightPurchase.quantity = int.Parse(dictionary["quantity"].ToString());
			}
			if (dictionary.ContainsKey("productIdentifier") && dictionary["productIdentifier"] != null)
			{
				upsightPurchase.productIdentifier = dictionary["productIdentifier"].ToString();
			}
			if (dictionary.ContainsKey("store") && dictionary["store"] != null)
			{
				upsightPurchase.store = dictionary["store"].ToString();
			}
			if (dictionary.ContainsKey("receipt") && dictionary["receipt"] != null)
			{
				upsightPurchase.receipt = dictionary["receipt"].ToString();
			}
			if (dictionary.ContainsKey("title") && dictionary["title"] != null)
			{
				upsightPurchase.title = dictionary["title"].ToString();
			}
			if (dictionary.ContainsKey("price") && dictionary["price"] != null)
			{
				upsightPurchase.price = double.Parse(dictionary["price"].ToString());
			}
		}
		return upsightPurchase;
	}

	public override string ToString()
	{
		return $"[UpsightPurchase: placement={placement}, quantity={quantity}, productIdentifier={productIdentifier}, store={store}, receipt={receipt}, title={title}, price={price}]";
	}
}
public class UpsightReward
{
	public string name { get; private set; }

	public int quantity { get; private set; }

	public string receipt { get; private set; }

	public static UpsightReward rewardFromJson(string json)
	{
		UpsightReward upsightReward = new UpsightReward();
		if (Json.Deserialize(json) is Dictionary<string, object> dictionary)
		{
			if (dictionary.ContainsKey("name"))
			{
				upsightReward.name = dictionary["name"].ToString();
			}
			if (dictionary.ContainsKey("quantity"))
			{
				upsightReward.quantity = int.Parse(dictionary["quantity"].ToString());
			}
			if (dictionary.ContainsKey("receipt"))
			{
				upsightReward.receipt = dictionary["receipt"].ToString();
			}
		}
		return upsightReward;
	}

	public override string ToString()
	{
		return $"[UpsightReward: name={name}, quantity={quantity}, receipt={receipt}]";
	}
}
public class UpsightDemoUI : MonoBehaviour
{
	public string androidAppToken;

	public string androidAppSecret;

	public string gcmProjectNumber;

	public string iosAppToken;

	public string iosAppSecret;

	private int _moreGamesBadgeCount = -1;

	private void Start()
	{
		Upsight.init(androidAppToken, androidAppSecret, gcmProjectNumber);
		UpsightManager.badgeCountRequestSucceededEvent += delegate(int badgeCount)
		{
			_moreGamesBadgeCount = badgeCount;
			Debug.Log("metadata request contained a badge with count: " + _moreGamesBadgeCount);
		};
		Upsight.registerForPushNotifications();
		Upsight.requestAppOpen();
	}

	private void OnApplicationPause(bool pauseStatus)
	{
		if (!pauseStatus)
		{
			Upsight.requestAppOpen();
		}
	}

	private void OnGUI()
	{
		beginGuiColomn();
		if (GUILayout.Button("Enable Verbose Logs (Android only)"))
		{
			Upsight.setLogLevel(UpsightLogLevel.VERBOSE);
		}
		if (GUILayout.Button("Request App Open"))
		{
			Upsight.requestAppOpen();
		}
		string text = "Send Content Request (more_games_only)";
		if (_moreGamesBadgeCount >= 0)
		{
			text += $" ({_moreGamesBadgeCount})";
		}
		if (GUILayout.Button(text))
		{
			Upsight.sendContentRequest("more_games_only", showsOverlayImmediately: true);
		}
		if (GUILayout.Button("Send Content Request (interstitial)"))
		{
			Upsight.sendContentRequest("interstitial", showsOverlayImmediately: true);
		}
		if (GUILayout.Button("Send Content Request (optin)"))
		{
			Upsight.sendContentRequest("optin", showsOverlayImmediately: true);
		}
		if (GUILayout.Button("Send Content Request (rewarded)"))
		{
			Upsight.sendContentRequest("rewarded", showsOverlayImmediately: false, shouldAnimate: false);
		}
		if (GUILayout.Button("Send Content Request (vg_test)"))
		{
			Upsight.sendContentRequest("vg_test", showsOverlayImmediately: true);
		}
		if (GUILayout.Button("Send Content Request (vg_test) with dimensions"))
		{
			Dictionary<string, object> dictionary = new Dictionary<string, object>();
			dictionary.Add("ua_source", "PlayHaven");
			dictionary.Add("gold_balance", 2170);
			dictionary.Add("registered", true);
			Upsight.sendContentRequest("vg_test", showsOverlayImmediately: true, shouldAnimate: false, dictionary);
		}
		if (GUILayout.Button("Toggle Opt Out Status"))
		{
			Upsight.setOptOutStatus(!Upsight.getOptOutStatus());
		}
		endGuiColumn(hasSecondColumn: true);
		if (GUILayout.Button("Preload Content Request (announce)"))
		{
			Upsight.preloadContentRequest("announce");
		}
		if (GUILayout.Button("Send Preloaded Content Request (announce)"))
		{
			Upsight.sendContentRequest("announce", showsOverlayImmediately: false);
		}
		if (GUILayout.Button("Get Content Badge Number (more_games_only)"))
		{
			Upsight.getContentBadgeNumber("more_games_only");
		}
		if (GUILayout.Button("Track In App Purchase"))
		{
			Upsight.trackInAppPurchase("com.playhaven.unityexample.plasmagun", 1, UpsightAndroidPurchaseResolution.Bought, 45.55, "the-order-id", "Play");
		}
		if (GUILayout.Button("Report Custom Event"))
		{
			Dictionary<string, object> dictionary2 = new Dictionary<string, object>();
			dictionary2.Add("first_key", "first_value");
			dictionary2.Add("second_key", 38);
			Upsight.reportCustomEvent(dictionary2);
		}
		GUILayout.Label("Push Notifications");
		if (GUILayout.Button("Register for Push Notifications"))
		{
			Upsight.registerForPushNotifications();
		}
		if (GUILayout.Button("Deregister for Push Notifications"))
		{
			Upsight.deregisterForPushNotifications();
		}
		endGuiColumn();
	}

	private void beginGuiColomn()
	{
		int num = ((Screen.width < 960 && Screen.height < 960) ? 30 : 70);
		GUI.skin.label.fixedHeight = num;
		GUI.skin.label.margin = new RectOffset(0, 0, 10, 0);
		GUI.skin.label.alignment = TextAnchor.MiddleCenter;
		GUI.skin.button.margin = new RectOffset(0, 0, 10, 0);
		GUI.skin.button.fixedHeight = num;
		GUI.skin.button.fixedWidth = Screen.width / 2 - 20;
		GUI.skin.button.wordWrap = true;
		GUILayout.BeginArea(new Rect(10f, 10f, Screen.width / 2, Screen.height));
		GUILayout.BeginVertical();
	}

	private void endGuiColumn(bool hasSecondColumn = false)
	{
		GUILayout.EndVertical();
		GUILayout.EndArea();
		if (hasSecondColumn)
		{
			GUILayout.BeginArea(new Rect(Screen.width - Screen.width / 2, 10f, Screen.width / 2, Screen.height));
			GUILayout.BeginVertical();
		}
	}
}
public class UpsightEventListener : MonoBehaviour
{
	private void OnEnable()
	{
		UpsightManager.openRequestSucceededEvent += openRequestSucceededEvent;
		UpsightManager.openRequestFailedEvent += openRequestFailedEvent;
		UpsightManager.contentWillDisplayEvent += contentWillDisplayEvent;
		UpsightManager.contentDidDisplayEvent += contentDidDisplayEvent;
		UpsightManager.contentRequestLoadedEvent += contentRequestLoadedEvent;
		UpsightManager.contentRequestFailedEvent += contentRequestFailedEvent;
		UpsightManager.contentPreloadSucceededEvent += contentPreloadSucceededEvent;
		UpsightManager.contentPreloadFailedEvent += contentPreloadFailedEvent;
		UpsightManager.badgeCountRequestSucceededEvent += badgeCountRequestSucceededEvent;
		UpsightManager.badgeCountRequestFailedEvent += badgeCountRequestFailedEvent;
		UpsightManager.trackInAppPurchaseSucceededEvent += trackInAppPurchaseSucceededEvent;
		UpsightManager.trackInAppPurchaseFailedEvent += trackInAppPurchaseFailedEvent;
		UpsightManager.reportCustomEventSucceededEvent += reportCustomEventSucceededEvent;
		UpsightManager.reportCustomEventFailedEvent += reportCustomEventFailedEvent;
		UpsightManager.contentDismissedEvent += contentDismissedEvent;
		UpsightManager.makePurchaseEvent += makePurchaseEvent;
		UpsightManager.dataOptInEvent += dataOptInEvent;
		UpsightManager.unlockedRewardEvent += unlockedRewardEvent;
		UpsightManager.pushNotificationWithContentReceivedEvent += pushNotificationWithContentReceivedEvent;
		UpsightManager.pushNotificationWithUrlReceivedEvent += pushNotificationWithUrlReceivedEvent;
	}

	private void OnDisable()
	{
		UpsightManager.openRequestSucceededEvent -= openRequestSucceededEvent;
		UpsightManager.openRequestFailedEvent -= openRequestFailedEvent;
		UpsightManager.contentWillDisplayEvent -= contentWillDisplayEvent;
		UpsightManager.contentDidDisplayEvent -= contentDidDisplayEvent;
		UpsightManager.contentRequestLoadedEvent -= contentRequestLoadedEvent;
		UpsightManager.contentRequestFailedEvent -= contentRequestFailedEvent;
		UpsightManager.contentPreloadSucceededEvent -= contentPreloadSucceededEvent;
		UpsightManager.contentPreloadFailedEvent -= contentPreloadFailedEvent;
		UpsightManager.badgeCountRequestSucceededEvent -= badgeCountRequestSucceededEvent;
		UpsightManager.badgeCountRequestFailedEvent -= badgeCountRequestFailedEvent;
		UpsightManager.trackInAppPurchaseSucceededEvent -= trackInAppPurchaseSucceededEvent;
		UpsightManager.trackInAppPurchaseFailedEvent -= trackInAppPurchaseFailedEvent;
		UpsightManager.reportCustomEventSucceededEvent -= reportCustomEventSucceededEvent;
		UpsightManager.reportCustomEventFailedEvent -= reportCustomEventFailedEvent;
		UpsightManager.contentDismissedEvent -= contentDismissedEvent;
		UpsightManager.makePurchaseEvent -= makePurchaseEvent;
		UpsightManager.dataOptInEvent -= dataOptInEvent;
		UpsightManager.unlockedRewardEvent -= unlockedRewardEvent;
		UpsightManager.pushNotificationWithContentReceivedEvent -= pushNotificationWithContentReceivedEvent;
		UpsightManager.pushNotificationWithUrlReceivedEvent -= pushNotificationWithUrlReceivedEvent;
	}

	private void openRequestSucceededEvent(Dictionary<string, object> dict)
	{
		Debug.Log("openRequestSucceededEvent: " + Json.Serialize(dict));
	}

	private void openRequestFailedEvent(string error)
	{
		Debug.Log("openRequestFailedEvent: " + error);
	}

	private void contentWillDisplayEvent(string placementID)
	{
		Debug.Log("contentWillDisplayEvent: " + placementID);
	}

	private void contentDidDisplayEvent(string placementID)
	{
		Debug.Log("contentDidDisplay: " + placementID);
	}

	private void contentRequestLoadedEvent(string placement)
	{
		Debug.Log("contentRequestLoadedEvent: " + placement);
	}

	private void contentRequestFailedEvent(string placement, string error)
	{
		Debug.Log($"contentRequestFailedEvent. placement: {placement}, error: {error}");
	}

	private void contentPreloadSucceededEvent(string placement)
	{
		Debug.Log("contentPreloadSucceededEvent: " + placement);
	}

	private void contentPreloadFailedEvent(string placement, string error)
	{
		Debug.Log($"contentPreloadFailedEvent. placement: {placement}, error: {error}");
	}

	private void badgeCountRequestSucceededEvent(int badgeCount)
	{
		Debug.Log("badgeCountRequestSucceededEvent: " + badgeCount);
	}

	private void badgeCountRequestFailedEvent(string error)
	{
		Debug.Log("badgeCountRequestFailedEvent: " + error);
	}

	private void trackInAppPurchaseSucceededEvent()
	{
		Debug.Log("trackInAppPurchaseSucceededEvent");
	}

	private void trackInAppPurchaseFailedEvent(string error)
	{
		Debug.Log("trackInAppPurchaseFailedEvent: " + error);
	}

	private void reportCustomEventSucceededEvent()
	{
		Debug.Log("reportCustomEventSucceededEvent");
	}

	private void reportCustomEventFailedEvent(string error)
	{
		Debug.Log("reportCustomEventFailedEvent: " + error);
	}

	private void contentDismissedEvent(string placement, string dismissType)
	{
		Debug.Log($"contentDismissedEvent. placement: {placement}, dismissType: {dismissType}");
	}

	private void makePurchaseEvent(UpsightPurchase purchase)
	{
		Debug.Log("makePurchaseEvent: " + purchase);
	}

	private void dataOptInEvent(Dictionary<string, object> dict)
	{
		Debug.Log("dataOptInEvent: " + Json.Serialize(dict));
	}

	private void unlockedRewardEvent(UpsightReward reward)
	{
		Debug.Log("unlockedRewardEvent: " + reward);
	}

	private void pushNotificationWithContentReceivedEvent(string messageID, string contentUnitID)
	{
		Debug.Log($"pushNotificationWithContentReceivedEvent. messageID: {messageID}, contentUnitID: {contentUnitID}");
	}

	private void pushNotificationWithUrlReceivedEvent(string url)
	{
		Debug.Log("pushNotificationWithUrlReceivedEvent: " + url);
	}
}
