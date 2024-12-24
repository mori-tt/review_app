SELECT shop_category.id,shop_category.name,pshop_category.ost_code,shop_category.address,tshop_category.el,shop_category.holiday,shop_category.seats,shop_category.price_range,shop_category.score,shop_category.geolocation_latitude,shop_category.geolocation_longitude, GROUP_CONCAT(m_category.name separator ', ') 
FROM ( SELECT * FROM (SELECT * FROM t_shop WHERE id=?) as shop 
LEFT JOIN t_shop_category ON shop.id = t_shop_category.shop_id) as t_shop_category 
LEFT JOIN m_category ON shop_category.catogory_id = m_category.jd 
GROUP BY shop_category.id