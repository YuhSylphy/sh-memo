import { Octokit } from 'octokit';
import { store } from '../../../core/store';

export const GITHUB_REPOSITORY_WEB_URL =
	'https://github.com/YuhSylphy/private-docs/';
export const GITHUB_REPOSITORY_OWNER = 'YuhSylphy';
export const GITHUB_REPOSITORY_NAME = 'private-docs';
export const GITHUB_REPOSITORY_REF = 'main';

/**
 * リポジトリファイルの読み取り結果。
 */
export type RepositoryFile = {
	/** リポジトリ内パス。 */
	path: string;
	/** UTF-8 文字列へデコード済みのコンテンツ。 */
	content: string;
	/** GitHub Content API が返す blob sha。更新時に必須。 */
	sha: string;
};

/**
 * リポジトリファイル更新の結果。
 */
export type RepositoryFileUpdateResult = {
	/** 更新後の blob sha。 */
	sha: string;
};

function normalizeRepositoryPath(pathInRepository: string): string {
	return pathInRepository.replace(/^\/+/, '');
}

function encodeBase64Utf8(content: string): string {
	const bytes = new TextEncoder().encode(content);
	const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join(
		'',
	);
	return btoa(binary);
}

function decodeBase64Utf8(content: string): string {
	const normalizedContent = content.replace(/\n/g, '');
	const binary = atob(normalizedContent);
	const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
	return new TextDecoder().decode(bytes);
}

function getConfigToken(): string {
	const token = store.getState().config.values.DOCS_API_KEY?.trim();
	if (!token) {
		throw new Error('DOCS_API_KEY is not set in config state.');
	}

	return token;
}

/**
 * GitHub Content API からファイル本体と sha を取得する。
 * @param repositoryPath リポジトリ配下の相対パス
 */
export async function fetchRepositoryFile(
	repositoryPath: string,
): Promise<RepositoryFile> {
	const path = normalizeRepositoryPath(repositoryPath);
	if (!path) {
		throw new Error('repositoryPath must not be empty.');
	}

	const octokit = new Octokit({ auth: getConfigToken() });
	const response = await octokit.rest.repos.getContent({
		owner: GITHUB_REPOSITORY_OWNER,
		repo: GITHUB_REPOSITORY_NAME,
		path,
		ref: GITHUB_REPOSITORY_REF,
	});

	if (Array.isArray(response.data)) {
		throw new Error(`The path is a directory, not a file: ${path}`);
	}

	if (
		response.data.type !== 'file' ||
		!response.data.content ||
		!response.data.sha
	) {
		throw new Error(`Could not read file content from path: ${path}`);
	}

	if (response.data.encoding !== 'base64') {
		throw new Error(
			`Unsupported content encoding: ${response.data.encoding ?? 'unknown'}`,
		);
	}

	return {
		path,
		content: decodeBase64Utf8(response.data.content),
		sha: response.data.sha,
	};
}

/**
 * GitHub Content API でファイルを更新する。
 * @param repositoryPath リポジトリ配下の相対パス
 * @param content 反映する UTF-8 テキスト
 * @param sha 更新前の blob sha
 */
export async function updateRepositoryFileContent(
	repositoryPath: string,
	content: string,
	sha: string,
): Promise<RepositoryFileUpdateResult> {
	const path = normalizeRepositoryPath(repositoryPath);
	if (!path) {
		throw new Error('repositoryPath must not be empty.');
	}

	const normalizedSha = sha.trim();
	if (!normalizedSha) {
		throw new Error('sha must not be empty.');
	}

	const octokit = new Octokit({ auth: getConfigToken() });
	const response = await octokit.rest.repos.createOrUpdateFileContents({
		owner: GITHUB_REPOSITORY_OWNER,
		repo: GITHUB_REPOSITORY_NAME,
		path,
		message: `Update ${path}`,
		content: encodeBase64Utf8(content),
		sha: normalizedSha,
		branch: GITHUB_REPOSITORY_REF,
	});

	if (!response.data.content?.sha) {
		throw new Error(`Failed to update file content for path: ${path}`);
	}

	return {
		sha: response.data.content.sha,
	};
}

export async function fetchRepositoryFileContent(
	repositoryPath: string,
): Promise<string> {
	const file = await fetchRepositoryFile(repositoryPath);
	return file.content;
}
