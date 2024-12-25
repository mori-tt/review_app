SELECT 
    shop.id,
    shop.name,
    shop.post_code,
    shop.address,
    shop.tel,
    shop.holiday,
    shop.seats,
    shop.score,
    GROUP_CONCAT(m_category.name separator ', ') as categories
FROM
(
    SELECT * 
    FROM t_shop
    ORDER BY score DESC
    LIMIT ?, ?
) as shop 
LEFT JOIN t_shop_category ON shop.id = t_shop_category.shop_id
LEFT JOIN m_category ON t_shop_category.category_id = m_category.id 
GROUP BY shop.id 
ORDER BY score DESC