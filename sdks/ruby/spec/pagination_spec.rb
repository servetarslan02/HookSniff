# frozen_string_literal: true

require 'spec_helper'
require 'hooksniff/pagination'

RSpec.describe HookSniff::Pagination do
  describe '.collect_all' do
    context 'with a single page of results' do
      it 'returns all items from one page' do
        items = (1..5).map { |i| { 'id' => i, 'name' => "item#{i}" } }
        fetch = lambda { |_limit, _offset|
          { 'data' => items, 'has_more' => false }
        }

        result = described_class.collect_all(limit: 50, &fetch)
        expect(result).to eq(items)
      end
    end

    context 'with multiple pages' do
      it 'paginates through all pages and collects items' do
        page1 = (1..3).map { |i| { 'id' => i } }
        page2 = (4..6).map { |i| { 'id' => i } }
        page3 = (7..8).map { |i| { 'id' => i } }

        pages = [page1, page2, page3]
        call_count = 0

        fetch = lambda { |_limit, _offset|
          page = pages[call_count]
          call_count += 1
          { 'data' => page, 'has_more' => call_count < pages.length }
        }

        result = described_class.collect_all(limit: 3, &fetch)
        expect(result.length).to eq(8)
        expect(result).to eq(page1 + page2 + page3)
      end

      it 'advances offset correctly between pages' do
        offsets_seen = []

        fetch = lambda { |limit, offset|
          offsets_seen << offset
          if offset < 10
            { 'data' => Array.new(5) { |i| { 'id' => offset + i } }, 'has_more' => true }
          else
            { 'data' => [], 'has_more' => false }
          end
        }

        described_class.collect_all(limit: 5, &fetch)
        expect(offsets_seen).to include(0, 5, 10)
      end
    end

    context 'with empty results' do
      it 'returns empty array when first page has no data' do
        fetch = lambda { |_limit, _offset|
          { 'data' => [], 'has_more' => false }
        }

        result = described_class.collect_all(limit: 50, &fetch)
        expect(result).to eq([])
      end

      it 'returns empty array when data key is nil' do
        fetch = lambda { |_limit, _offset|
          { 'data' => nil, 'has_more' => false }
        }

        result = described_class.collect_all(limit: 50, &fetch)
        expect(result).to eq([])
      end
    end

    context 'with max_pages limit' do
      it 'stops after max_pages iterations' do
        call_count = 0

        fetch = lambda { |_limit, _offset|
          call_count += 1
          { 'data' => [{ 'id' => call_count }], 'has_more' => true }
        }

        result = described_class.collect_all(limit: 1, max_pages: 3, &fetch)
        # max_pages=3 means at most 3 pages fetched (0, 1, 2)
        expect(result.length).to eq(3)
        expect(call_count).to eq(3)
      end

      it 'returns all items before hitting max_pages if data exhausted' do
        call_count = 0

        fetch = lambda { |_limit, _offset|
          call_count += 1
          if call_count <= 2
            { 'data' => [{ 'id' => call_count }], 'has_more' => true }
          else
            { 'data' => [], 'has_more' => false }
          end
        }

        result = described_class.collect_all(limit: 1, max_pages: 100, &fetch)
        expect(result.length).to eq(2)
        expect(call_count).to eq(3) # called 3 times, third returns empty
      end
    end

    context 'with symbol keys' do
      it 'supports symbol-keyed hash responses' do
        items = [{ id: 1 }, { id: 2 }]
        fetch = lambda { |_limit, _offset|
          { data: items, has_more: false }
        }

        result = described_class.collect_all(limit: 50, &fetch)
        expect(result).to eq(items)
      end
    end
  end

  describe '.paginate' do
    it 'returns an Enumerator' do
      fetch = lambda { |_l, _o| { 'data' => [], 'has_more' => false } }
      result = described_class.paginate(limit: 50, &fetch)
      expect(result).to be_a(Enumerator)
    end

    it 'yields items lazily' do
      items = (1..3).map { |i| { 'id' => i } }
      fetch = lambda { |_l, _o| { 'data' => items, 'has_more' => false } }

      enum = described_class.paginate(limit: 50, &fetch)
      expect(enum.next).to eq(items[0])
      expect(enum.next).to eq(items[1])
      expect(enum.next).to eq(items[2])
      expect { enum.next }.to raise_error(StopIteration)
    end
  end
end
