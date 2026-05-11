# frozen_string_literal: true

module HookSniff
  module Pagination
    # Iterate through all items across pages
    # fetch_page: block that takes (limit, offset) and returns { data: [...], has_more: bool }
    def self.paginate(limit: 50, max_pages: 100, &fetch_page)
      Enumerator.new do |yielder|
        offset = 0
        pages = 0
        loop do
          break if pages >= max_pages
          result = fetch_page.call(limit, offset)
          data = result['data'] || result[:data] || []
          has_more = result['has_more'] || result[:has_more] || false
          data.each { |item| yielder.yield(item) }
          break if !has_more || data.empty?
          offset += data.length
          pages += 1
        end
      end
    end

    # Collect all items into an array
    def self.collect_all(limit: 50, max_pages: 100, &fetch_page)
      paginate(limit: limit, max_pages: max_pages, &fetch_page).to_a
    end
  end
end
