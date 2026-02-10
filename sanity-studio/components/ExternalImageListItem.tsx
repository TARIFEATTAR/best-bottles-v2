import React from 'react'
import { Box, Card, Flex, Stack, Text } from '@sanity/ui'
import { PreviewProps } from 'sanity'

interface ExternalImageListItemProps extends PreviewProps {
    imageUrl?: string
    title?: string
    subtitle?: string
}

export function ExternalImageListItem(props: ExternalImageListItemProps) {
    const { imageUrl, title, subtitle } = props

    return (
        <Card padding={2} radius={2}>
            <Flex align="center" gap={3}>
                {/* Image Thumbnail */}
                <Box
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 4,
                        overflow: 'hidden',
                        flexShrink: 0,
                        backgroundColor: '#f0f0f0',
                    }}
                >
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={title || 'Preview'}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                            }}
                        />
                    ) : (
                        <Flex
                            align="center"
                            justify="center"
                            style={{ width: '100%', height: '100%' }}
                        >
                            <Text size={0} muted>
                                —
                            </Text>
                        </Flex>
                    )}
                </Box>

                {/* Title and Subtitle */}
                <Stack space={2} flex={1}>
                    <Text size={1} weight="medium">
                        {title || 'Untitled'}
                    </Text>
                    {subtitle && (
                        <Text size={1} muted>
                            {subtitle}
                        </Text>
                    )}
                </Stack>
            </Flex>
        </Card>
    )
}

export default ExternalImageListItem
