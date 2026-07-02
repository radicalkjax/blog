using System.Reflection;
using System.Runtime.CompilerServices;
using UnityEngine;

[assembly: RuntimeCompatibility(WrapNonExceptionThrows = true)]
[assembly: AssemblyVersion("0.0.0.0")]
public class Booper : MonoBehaviour
{
	private int numBGpanels = 8;

	private float asteroidMax = 6.420372f;

	private float asteroidMin = 0.6145836f;

	private void Start()
	{
		GameObject[] array = GameObject.FindGameObjectsWithTag("Asteroids");
		GameObject[] array2 = array;
		foreach (GameObject gameObject in array2)
		{
			Vector3 position = gameObject.transform.position;
			position.y = Random.Range(asteroidMin, asteroidMax);
			gameObject.transform.position = position;
		}
	}

	private void OnTriggerEnter2D(Collider2D collider)
	{
		Debug.Log("Triggered : " + collider.name);
		float x = ((BoxCollider2D)collider).size.x;
		Vector3 position = collider.transform.position;
		position.x += x * (float)numBGpanels;
		if (collider.tag == "Asteroids")
		{
			position.y = Random.Range(asteroidMin, asteroidMax);
		}
		collider.transform.position = position;
	}
}
public class PlayHaven : MonoBehaviour
{
	public string androidAppToken = string.Empty;

	public string androidAppSecret = string.Empty;

	public string iosAppToken = string.Empty;

	public string iosAppSecret = string.Empty;

	private void Start()
	{
		Upsight.init(androidAppToken, androidAppSecret);
		Upsight.requestAppOpen();
		Upsight.sendContentRequest("app_launch", showsOverlayImmediately: true);
	}

	private void OnApplicationPause(bool pauseStatus)
	{
		if (!pauseStatus)
		{
			Upsight.requestAppOpen();
		}
	}
}
public class Score : MonoBehaviour
{
	private static int score;

	private static int highScore;

	private static Score instance;

	private WeenieThrust Weenie;

	public static void AddPoint()
	{
		if (!instance.Weenie.dead)
		{
			score++;
			if (score > highScore)
			{
				highScore = score;
			}
		}
	}

	private void Start()
	{
		instance = this;
		GameObject gameObject = GameObject.FindGameObjectWithTag("Player");
		if (gameObject == null)
		{
			Debug.LogError("Could not find an object with tag 'Player'.");
		}
		Weenie = gameObject.GetComponent<WeenieThrust>();
		score = 0;
		highScore = PlayerPrefs.GetInt("highScore", 0);
	}

	private void OnDestroy()
	{
		instance = null;
		PlayerPrefs.SetInt("highScore", highScore);
	}

	private void Update()
	{
		base.guiText.text = "Score: " + score + "\nHigh Score: " + highScore;
	}
}
public class SpaceSlow : MonoBehaviour
{
	private float speed = 2f;

	private void FixedUpdate()
	{
		Vector3 position = base.transform.position;
		position.x += speed * Time.deltaTime;
		base.transform.position = position;
	}
}
public class WeenieThrust : MonoBehaviour
{
	public float thrustSpeed = 100f;

	public float fowardSpeed = 1f;

	private bool didThrust;

	private Animator animator;

	public bool dead;

	private float deathCoolDown;

	public float time;

	private void Start()
	{
		animator = base.transform.GetComponentInChildren<Animator>();
	}

	private void Update()
	{
		if (dead)
		{
			deathCoolDown -= Time.deltaTime;
			if (deathCoolDown <= 0f)
			{
				Application.LoadLevel(Application.loadedLevel);
			}
		}
		else if (Input.GetKeyDown(KeyCode.Space) || Input.GetMouseButtonDown(0))
		{
			didThrust = true;
		}
	}

	private void FixedUpdate()
	{
		if (!dead)
		{
			base.rigidbody2D.AddForce(Vector2.right * fowardSpeed);
			if (didThrust)
			{
				base.rigidbody2D.AddForce(Vector2.up * thrustSpeed);
				animator.SetTrigger("PositiveThrust");
				didThrust = false;
			}
		}
	}

	private void OnCollisionEnter2D(Collision2D collision)
	{
		animator.SetTrigger("Boom");
		dead = true;
		if (dead = true)
		{
			base.rigidbody2D.isKinematic = true;
		}
		deathCoolDown = 0.8f;
	}
}
public class WeenieTracker : MonoBehaviour
{
	private Transform player;

	private float offsetX;

	private void Start()
	{
		GameObject gameObject = GameObject.FindGameObjectWithTag("Player");
		if (gameObject == null)
		{
			Debug.LogError("Couldn't find an object with tag 'Player'!");
			return;
		}
		player = gameObject.transform;
		offsetX = base.transform.position.x - player.position.x;
	}

	private void Update()
	{
		if (player != null)
		{
			Vector3 position = base.transform.position;
			position.x = player.position.x + offsetX;
			base.transform.position = position;
		}
	}
}
public class meter_score : MonoBehaviour
{
	private void OnTriggerEnter2D(Collider2D collider)
	{
		if (collider.tag == "Player")
		{
			Score.AddPoint();
		}
	}
}
public class title : MonoBehaviour
{
	private static bool sawOnce;

	private void Start()
	{
		if (!sawOnce)
		{
			GetComponent<SpriteRenderer>().enabled = true;
			Time.timeScale = 0f;
		}
		sawOnce = true;
	}

	private void Update()
	{
		if (Time.timeScale == 0f && (Input.GetKeyDown(KeyCode.Space) || Input.GetMouseButtonDown(0)))
		{
			Time.timeScale = 1f;
			GetComponent<SpriteRenderer>().enabled = false;
		}
	}
}
