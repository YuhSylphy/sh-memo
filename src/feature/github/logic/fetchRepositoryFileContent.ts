import { Octokit } from 'octokit';
import { store } from '../../../core/store';

export const GITHUB_REPOSITORY_WEB_URL =
	'https://github.com/YuhSylphy/private-docs/';
export const GITHUB_REPOSITORY_OWNER = 'YuhSylphy';
export const GITHUB_REPOSITORY_NAME = 'private-docs';
export const GITHUB_REPOSITORY_REF = 'main';

function normalizeRepositoryPath(pathInRepository: string): string {
	return pathInRepository.replace(/^\/+/, '');
}

function decodeBase64Utf8(content: string): string {
	const normalizedContent = content.replace(/\n/g, '');
	const binary = atob(normalizedContent);
	const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
	return new TextDecoder().decode(bytes);
}

export async function fetchRepositoryFileContent(
	repositoryPath: string,
): Promise<string> {
	// repositoryPath is interpreted as a path relative to the fixed repository root.
	const path = normalizeRepositoryPath(repositoryPath);
	if (!path) {
		throw new Error('repositoryPath must not be empty.');
	}

	const token = store.getState().config.values.DOCS_API_KEY?.trim();
	if (!token) {
		throw new Error('DOCS_API_KEY is not set in config state.');
	}

	const octokit = new Octokit({ auth: token });
	const response = await octokit.rest.repos.getContent({
		owner: GITHUB_REPOSITORY_OWNER,
		repo: GITHUB_REPOSITORY_NAME,
		path,
		ref: GITHUB_REPOSITORY_REF,
	});

	if (Array.isArray(response.data)) {
		throw new Error(`The path is a directory, not a file: ${path}`);
	}

	if (response.data.type !== 'file' || !response.data.content) {
		throw new Error(`Could not read file content from path: ${path}`);
	}

	if (response.data.encoding !== 'base64') {
		throw new Error(
			`Unsupported content encoding: ${response.data.encoding ?? 'unknown'}`,
		);
	}

	return decodeBase64Utf8(response.data.content);
}
