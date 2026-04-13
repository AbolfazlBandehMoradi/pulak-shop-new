import { apiRequest } from './api'

export enum CommentResourceType {
  Blog = 1,
  Product = 2,
  Page = 3
}

export enum CommentStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2
}

export interface AuthorAvatar {
  id: number
  fileName: string
  filePath: string
  thumbnailPath?: string
}

export interface Comment {
  id: number
  content: string
  authorId: number
  authorName: string
  authorEmail?: string
  authorAvatar?: AuthorAvatar
  createdAt: string
  updatedAt?: string
  status: CommentStatus
  resourceId: number
  resourceType: CommentResourceType
  resourceTitle?: string
  parentId?: number
  replies: Comment[]
}

export interface CreateCommentRequest {
  content: string
  resourceId: number
  resourceType: CommentResourceType
  parentId?: number
}

export interface UpdateCommentRequest {
  content: string
}

export interface CommentsResponse {
  comments: Comment[]
  totalCount: number
  pageNumber: number
  pageSize: number
}

export interface GetCommentsParams {
  resourceType: CommentResourceType
  resourceId: number
  parentId?: number
  pageNumber?: number
  pageSize?: number
  langCode?: string
}

/**
 * Get comments for a resource (Product, Blog, or Page)
 */
export async function getComments(params: GetCommentsParams): Promise<CommentsResponse> {
  const queryParams = new URLSearchParams()
  
  queryParams.append('resourceType', params.resourceType.toString())
  queryParams.append('resourceId', params.resourceId.toString())
  
  if (params.parentId !== undefined) {
    queryParams.append('parentId', params.parentId.toString())
  }
  if (params.pageNumber) {
    queryParams.append('pageNumber', params.pageNumber.toString())
  }
  if (params.pageSize) {
    queryParams.append('pageSize', params.pageSize.toString())
  }
  if (params.langCode) {
    queryParams.append('langCode', params.langCode)
  }

  const response = await apiRequest(
    `/api/ui/comments?${queryParams.toString()}`
  ) as CommentsResponse

  return response
}

/**
 * Get a single comment by ID
 */
export async function getComment(id: number, langCode?: string): Promise<Comment> {
  const queryParams = new URLSearchParams()
  if (langCode) {
    queryParams.append('langCode', langCode)
  }

  const response = await apiRequest(
    `/api/ui/comments/${id}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  ) as Comment

  return response
}

/**
 * Create a new comment (requires authentication)
 */
export async function createComment(
  request: CreateCommentRequest,
  langCode?: string
): Promise<Comment> {
  const queryParams = new URLSearchParams()
  if (langCode) {
    queryParams.append('langCode', langCode)
  }

  const response = await apiRequest(
    `/api/ui/comments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
    {
      method: 'POST',
      body: JSON.stringify(request)
    }
  ) as Comment

  return response
}

/**
 * Reply to a comment (requires authentication)
 */
export async function replyToComment(
  parentId: number,
  request: CreateCommentRequest,
  langCode?: string
): Promise<Comment> {
  const queryParams = new URLSearchParams()
  if (langCode) {
    queryParams.append('langCode', langCode)
  }

  const response = await apiRequest(
    `/api/ui/comments/${parentId}/reply${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
    {
      method: 'POST',
      body: JSON.stringify(request)
    }
  ) as Comment

  return response
}

/**
 * Update a comment (requires authentication, can only update own comments)
 */
export async function updateComment(
  id: number,
  request: UpdateCommentRequest,
  langCode?: string
): Promise<Comment> {
  const queryParams = new URLSearchParams()
  if (langCode) {
    queryParams.append('langCode', langCode)
  }

  const response = await apiRequest(
    `/api/ui/comments/${id}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
    {
      method: 'PUT',
      body: JSON.stringify(request)
    }
  ) as Comment

  return response
}

/**
 * Delete a comment (requires authentication, can only delete own comments)
 */
export async function deleteComment(id: number, langCode?: string): Promise<void> {
  const queryParams = new URLSearchParams()
  if (langCode) {
    queryParams.append('langCode', langCode)
  }

  await apiRequest(
    `/api/ui/comments/${id}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
    {
      method: 'DELETE'
    }
  )
}

