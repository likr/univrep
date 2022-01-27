import csv
import datetime
import os
import feedparser
import scrapy


class NewsSpider(scrapy.Spider):
    name = "news"

    def start_requests(self):
        csv_path = os.path.join(
            os.path.dirname(__file__),
            '../../../data/university.csv')
        for item in csv.DictReader(open(csv_path)):
            university_name = item['大学名']
            start_date = datetime.date(2021, 1, 1)
            end_date = datetime.date(2021, 12, 31)
            t0 = start_date
            while t0 <= end_date:
                t = t0 + datetime.timedelta(days=1)
                after = t0.strftime('%Y-%m-%d')
                before = t.strftime('%Y-%m-%d')
                url = 'https://news.google.com/rss/search?hl=ja&gl=JP&ceid=JP:ja'\
                    f'&q={university_name}+after:{after}+before:{before}'
                yield scrapy.Request(url=url, callback=self.parse_feed,
                                     meta={'university': university_name})
                t0 = t

    def parse_feed(self, response):
        d = feedparser.parse(response.body)
        for item in d.entries:
            yield {
                'id': item.id,
                'title': item.title,
                'link': item.link,
                'description': item.description,
                'published': item.published,
                'university': response.meta['university']
            }
