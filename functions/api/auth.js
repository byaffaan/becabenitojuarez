export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${env.GITHUB_CLIENT_ID}&scope=repo,user`;
    return Response.redirect(redirectUrl, 302);
  }

  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code
    })
  });

  const tokenData = await tokenResponse.json();
  const token = tokenData.access_token;

  const html = `<!doctype html>
<html>
<body>
<script>
  const msg = JSON.stringify({
    token: "${token}",
    provider: "github"
  });
  window.opener.postMessage(
    'authorization:github:success:' + msg,
    '*'
  );
  window.close();
</script>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html" }
  });
}