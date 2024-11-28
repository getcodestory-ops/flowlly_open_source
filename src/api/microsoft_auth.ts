export async function loginWithMicrosoft(session: string, projectId: string) {
  const response = await fetch("/api/microsoft/auth", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ projectId }),
  });
  return response.json();
}

export async function getMicrosoftToken(
  session: string,
  projectId: string,
  code: string
) {
  const response = await fetch("/api/microsoft/token", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ projectId, code }),
  });
  return response.json();
}
