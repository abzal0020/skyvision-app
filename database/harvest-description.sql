-- Applied after restore: the old Harvest JSX used nested markup, not a plain paragraph.
with changed as (
  update public.sv_catalog_drafts set content=jsonb_set(content,'{description}',
    '{"ru":"Harvest — производитель муки в Костанае. На странице представлены фотографии производства, видео и протокол испытаний продукции. Условия поставки согласовываются при оформлении заявки.","zh":"Harvest 是位于科斯塔奈的面粉生产商。本页提供工厂照片、视频和产品检测报告。供货条件在下单时协商确认。"}'::jsonb)
  where slug='harvest' and version=1 and content#>>'{description,ru}'=''
  returning id,content
)
update public.sv_catalog c set content=changed.content from changed where c.id=changed.id;
